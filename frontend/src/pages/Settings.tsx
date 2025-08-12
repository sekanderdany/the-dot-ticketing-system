import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Settings
              </h3>
              <div className="space-y-4">                <div>
                  <label htmlFor="app-name" className="block text-sm font-medium text-gray-700">
                    Application Name
                  </label>
                  <input
                    id="app-name"
                    type="text"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="The Dot - ITSM"
                  />
                </div>
                <div>
                  <label htmlFor="email-notifications" className="block text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <select 
                    id="email-notifications"
                    title="Email notification settings"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
