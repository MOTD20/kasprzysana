const express = require('express');
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new team
router.post('/', auth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Team name must be at least 2 characters'),
  body('description').optional().trim(),
  body('settings.allowMemberInvites').optional().isBoolean(),
  body('settings.requireApproval').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, settings = {} } = req.body;

    const team = new Team({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }],
      settings: {
        allowMemberInvites: settings.allowMemberInvites !== false,
        requireApproval: settings.requireApproval || false
      }
    });

    await team.save();
    await team.generateReferralLink();

    res.status(201).json({
      message: 'Team created successfully',
      team: await team.populate('owner', 'name email avatar')
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's teams
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('projects', 'name description color');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a member
    const isMember = team.owner.equals(req.user._id) || 
                    team.members.some(member => member.user.equals(req.user._id));

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new referral link
router.post('/:id/referral-link', auth, [
  body('expiresInDays').optional().isInt({ min: 1, max: 365 }),
  body('maxUses').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is owner or admin
    const isOwner = team.owner.equals(req.user._id);
    const isAdmin = team.members.find(member => 
      member.user.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { expiresInDays = 30, maxUses } = req.body;
    await team.generateReferralLink(expiresInDays, maxUses);

    res.json({
      message: 'Referral link generated successfully',
      referralLink: {
        code: team.referralLink.code,
        expiresAt: team.referralLink.expiresAt,
        maxUses: team.referralLink.maxUses,
        currentUses: team.referralLink.currentUses,
        fullUrl: `${process.env.FRONTEND_URL || 'https://kasprzysana.onrender.com'}/join-team/${team.referralLink.code}`
      }
    });
  } catch (error) {
    console.error('Generate referral link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join team via referral link
router.post('/join/:referralCode', auth, async (req, res) => {
  try {
    const team = await Team.findOne({ 'referralLink.code': req.params.referralCode });
    if (!team) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    await team.joinViaReferral(req.user._id, req.params.referralCode);

    res.json({
      message: 'Successfully joined team',
      team: await team.populate('owner', 'name email avatar')
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update team settings
router.patch('/:id/settings', auth, [
  body('settings.allowMemberInvites').optional().isBoolean(),
  body('settings.requireApproval').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is owner or admin
    const isOwner = team.owner.equals(req.user._id);
    const isAdmin = team.members.find(member => 
      member.user.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { settings } = req.body;
    if (settings) {
      team.settings = { ...team.settings, ...settings };
    }

    await team.save();

    res.json({
      message: 'Team settings updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is owner or admin
    const isOwner = team.owner.equals(req.user._id);
    const isAdmin = team.members.find(member => 
      member.user.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Cannot remove owner
    if (team.owner.equals(req.params.userId)) {
      return res.status(400).json({ message: 'Cannot remove team owner' });
    }

    // Remove member
    team.members = team.members.filter(member => !member.user.equals(req.params.userId));
    await team.save();

    res.json({
      message: 'Member removed successfully',
      team
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 