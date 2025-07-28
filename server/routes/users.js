const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all users (for project member selection)
router.get('/', auth, async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    
    const filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email avatar')
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar role createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (admin only)
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can update other users
    if (!req.user.role === 'admin' && !req.user._id.equals(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, role, isActive } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email;
    }
    if (role && req.user.role === 'admin') updates.role = role;
    if (isActive !== undefined && req.user.role === 'admin') updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('name email avatar role isActive createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's task statistics
    const Task = require('../models/Task');
    const Project = require('../models/Project');

    const taskStats = await Task.aggregate([
      { $match: { 'assignees.user': user._id, isArchived: false } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const projectStats = await Project.aggregate([
      { $match: { 
        $or: [
          { owner: user._id },
          { 'members.user': user._id }
        ]
      }},
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const stats = {
      tasks: {
        total: 0,
        todo: 0,
        in_progress: 0,
        review: 0,
        done: 0
      },
      projects: {
        total: 0,
        active: 0,
        archived: 0,
        completed: 0
      }
    };

    taskStats.forEach(stat => {
      stats.tasks[stat._id] = stat.count;
      stats.tasks.total += stat.count;
    });

    projectStats.forEach(stat => {
      stats.projects[stat._id] = stat.count;
      stats.projects.total += stat.count;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 