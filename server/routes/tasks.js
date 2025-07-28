const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.toggleCompletion(req.user._id);
    
    res.json({
      message: 'Task completion toggled successfully',
      task: {
        _id: task._id,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt,
        completedBy: task.completedBy
      }
    });
  } catch (error) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task completion progress
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const progress = await task.getCompletionProgress();
    
    res.json({
      taskId: task._id,
      progress,
      isCompleted: task.isCompleted,
      totalSubtasks: task.subtasks.length
    });
  } catch (error) {
    console.error('Get task progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add subtask to task
router.post('/:id/subtasks', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parentTask = await Task.findById(req.params.id);
    if (!parentTask) {
      return res.status(404).json({ message: 'Parent task not found' });
    }

    // Check access to parent task
    const project = await Project.findById(parentTask.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, priority = 'medium' } = req.body;

    const subtask = new Task({
      title,
      description,
      project: parentTask.project,
      creator: req.user._id,
      priority,
      parentTask: parentTask._id
    });

    await subtask.save();

    // Add subtask to parent task
    parentTask.subtasks.push(subtask._id);
    await parentTask.save();

    res.status(201).json({
      message: 'Subtask created successfully',
      subtask: await subtask.populate('creator', 'name email avatar')
    });
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subtasks of a task
router.get('/:id/subtasks', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await Task.find({ _id: { $in: task.subtasks } })
      .populate('creator', 'name email avatar')
      .populate('assignees.user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({ subtasks });
  } catch (error) {
    console.error('Get subtasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks with filtering
router.get('/', auth, async (req, res) => {
  try {
    const {
      project,
      status,
      priority,
      assignee,
      search,
      dueDate,
      tags,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { isArchived: false };

    // Filter by project
    if (project) {
      // Check if user has access to this project
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const hasAccess = projectDoc.owner.equals(req.user._id) || 
                       projectDoc.members.some(member => member.user.equals(req.user._id)) ||
                       projectDoc.isPublic;

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      filter.project = project;
    } else {
      // If no specific project, get tasks from all accessible projects
      const accessibleProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id },
          { isPublic: true }
        ]
      });

      filter.project = { $in: accessibleProjects.map(p => p._id) };
    }

    // Apply other filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter['assignees.user'] = assignee;
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    if (tags && tags.length > 0) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .populate('creator', 'name email avatar')
      .populate('assignees.user', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('description').optional().trim(),
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assignees').optional().isArray(),
  body('tags').optional().isArray(),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      project,
      status = 'todo',
      priority = 'medium',
      dueDate,
      assignees = [],
      tags = [],
      estimatedHours,
      parentTask
    } = req.body;

    // Check if user has access to the project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = projectDoc.owner.equals(req.user._id) || 
                     projectDoc.members.some(member => member.user.equals(req.user._id)) ||
                     projectDoc.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate assignees
    if (assignees.length > 0) {
      const validAssignees = await User.find({
        _id: { $in: assignees },
        isActive: true
      });

      if (validAssignees.length !== assignees.length) {
        return res.status(400).json({ message: 'One or more assignees are invalid' });
      }
    }

    const task = new Task({
      title,
      description: description || '',
      project,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignees: assignees.map(userId => ({ user: userId })),
      tags,
      creator: req.user._id,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      parentTask
    });

    await task.save();
    await task.populate('project', 'name color');
    await task.populate('creator', 'name email avatar');
    await task.populate('assignees.user', 'name email avatar');

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color')
      .populate('creator', 'name email avatar')
      .populate('assignees.user', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('parentTask', 'title')
      .populate('subtasks', 'title status');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Task title cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assignees').optional().isArray(),
  body('tags').optional().isArray(),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
  body('actualHours').optional().isNumeric().withMessage('Actual hours must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.priority !== undefined) updates.priority = req.body.priority;
    if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;
    if (req.body.estimatedHours !== undefined) updates.estimatedHours = req.body.estimatedHours ? parseFloat(req.body.estimatedHours) : null;
    if (req.body.actualHours !== undefined) updates.actualHours = req.body.actualHours ? parseFloat(req.body.actualHours) : null;

    // Handle assignees separately
    if (req.body.assignees !== undefined) {
      if (req.body.assignees.length > 0) {
        const validAssignees = await User.find({
          _id: { $in: req.body.assignees },
          isActive: true
        });

        if (validAssignees.length !== req.body.assignees.length) {
          return res.status(400).json({ message: 'One or more assignees are invalid' });
        }
      }
      updates.assignees = req.body.assignees.map(userId => ({ user: userId }));
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('project', 'name color')
    .populate('creator', 'name email avatar')
    .populate('assignees.user', 'name email avatar')
    .populate('comments.user', 'name email avatar');

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to task
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    await task.save();
    await task.populate('comments.user', 'name email avatar');

    res.json({ task });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive task
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.equals(req.user._id) || 
                     project.members.some(member => member.user.equals(req.user._id)) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.isArchived = true;
    await task.save();

    res.json({ message: 'Task archived successfully' });
  } catch (error) {
    console.error('Archive task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 