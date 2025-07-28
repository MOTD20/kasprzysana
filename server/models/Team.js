const mongoose = require('mongoose');
const crypto = require('crypto');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  referralLink: {
    code: {
      type: String,
      unique: true,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date
    },
    maxUses: {
      type: Number,
      default: null
    },
    currentUses: {
      type: Number,
      default: 0
    }
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate referral link code
teamSchema.methods.generateReferralLink = function(expiresInDays = 30, maxUses = null) {
  this.referralLink = {
    code: crypto.randomBytes(8).toString('hex'),
    isActive: true,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    maxUses: maxUses,
    currentUses: 0
  };
  return this.save();
};

// Join team via referral link
teamSchema.methods.joinViaReferral = async function(userId, referralCode) {
  if (!this.referralLink || !this.referralLink.isActive) {
    throw new Error('Referral link is not active');
  }
  
  if (this.referralLink.code !== referralCode) {
    throw new Error('Invalid referral code');
  }
  
  if (this.referralLink.expiresAt && new Date() > this.referralLink.expiresAt) {
    throw new Error('Referral link has expired');
  }
  
  if (this.referralLink.maxUses && this.referralLink.currentUses >= this.referralLink.maxUses) {
    throw new Error('Referral link usage limit reached');
  }
  
  // Check if user is already a member
  const isMember = this.members.some(member => member.user.toString() === userId.toString());
  if (isMember) {
    throw new Error('User is already a member of this team');
  }
  
  // Add user to team
  this.members.push({
    user: userId,
    role: 'member',
    joinedAt: new Date()
  });
  
  // Update referral link usage
  this.referralLink.currentUses += 1;
  
  return this.save();
};

// Indexes
teamSchema.index({ 'referralLink.code': 1 });
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isActive: 1 });

module.exports = mongoose.model('Team', teamSchema); 