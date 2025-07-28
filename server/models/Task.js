const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ creator: 1 });
taskSchema.index({ isCompleted: 1 });

// Method to toggle task completion
taskSchema.methods.toggleCompletion = async function(userId) {
  this.isCompleted = !this.isCompleted;
  if (this.isCompleted) {
    this.completedAt = new Date();
    this.completedBy = userId;
  } else {
    this.completedAt = null;
    this.completedBy = null;
  }
  return this.save();
};

// Method to get completion progress
taskSchema.methods.getCompletionProgress = async function() {
  const totalSubtasks = this.subtasks.length;
  if (totalSubtasks === 0) {
    return this.isCompleted ? 100 : 0;
  }
  
  const completedSubtasks = await this.constructor.countDocuments({
    _id: { $in: this.subtasks },
    isCompleted: true
  });
  
  return Math.round((completedSubtasks / totalSubtasks) * 100);
};

module.exports = mongoose.model('Task', taskSchema); 