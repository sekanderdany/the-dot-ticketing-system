import React from 'react';

const Applications: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Manage application lifecycle and deployments</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Applications</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Application management interface coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
