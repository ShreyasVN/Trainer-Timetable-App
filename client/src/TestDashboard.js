import React from 'react';
import PropTypes from 'prop-types';

const TestDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name || 'User'}!
            </h1>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                🎉 Login Successful!
              </h2>
              <p className="text-green-600">
                You have successfully logged in to the trainer dashboard.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                User Information
              </h2>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
                <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Navigation Test</h3>
            <p className="text-sm text-gray-600">
              If you can see this page, the login navigation is working correctly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

TestDashboard.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default TestDashboard;
