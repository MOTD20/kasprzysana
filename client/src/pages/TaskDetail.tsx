import React from 'react';
import { useParams } from 'react-router-dom';

const TaskDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
        <p className="text-gray-600">Task ID: {id}</p>
      </div>
      <div className="card">
        <div className="card-body">
          <p>Task detail page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 