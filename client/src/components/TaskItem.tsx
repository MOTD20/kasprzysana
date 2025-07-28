import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

interface TaskItemProps {
  task: {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: {
      _id: string;
      name: string;
    };
    dueDate?: string;
    assignees: Array<{
      user: {
        _id: string;
        name: string;
        email: string;
      };
    }>;
    subtasks: string[];
  };
  onToggle?: (taskId: string, isCompleted: boolean) => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />;
    }
    
    switch (status) {
      case 'done':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggle = async () => {
    try {
      const response = await axios.patch(`/api/tasks/${task._id}/toggle`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (onToggle) {
        onToggle(task._id, response.data.task.isCompleted);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow ${
      task.isCompleted ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start space-x-3">
        {/* Completion checkbox */}
        <button
          onClick={handleToggle}
          className={`mt-1 p-1 rounded-full hover:bg-gray-100 transition-colors ${
            task.isCompleted ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          {getStatusIcon(task.status, task.isCompleted)}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium text-gray-900 ${
                task.isCompleted ? 'line-through' : ''
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm text-gray-500 mt-1 ${
                  task.isCompleted ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Priority badge */}
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {/* Task metadata */}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            {task.dueDate && (
              <span>Due: {formatDate(task.dueDate)}</span>
            )}
            {task.assignees.length > 0 && (
              <span>{task.assignees.length} assignee{task.assignees.length !== 1 ? 's' : ''}</span>
            )}
            {task.subtasks.length > 0 && (
              <span>{task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}</span>
            )}
            {task.isCompleted && task.completedAt && (
              <span>Completed: {formatDate(task.completedAt)}</span>
            )}
          </div>

          {/* Completion info */}
          {task.isCompleted && task.completedBy && (
            <div className="mt-2 text-xs text-green-600">
              Completed by {task.completedBy.name}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 