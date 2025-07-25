import React from 'react';

const DashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Cards - Replace with actual dashboard widgets */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Papers</h2>
          <p className="text-4xl font-bold text-blue-500">1,234</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Stock Value</h2>
          <p className="text-4xl font-bold text-green-500">$56,789</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Pending Transfers</h2>
          <p className="text-4xl font-bold text-yellow-500">5</p>
        </div>
      </div>
      {/* Further dashboard content can go here */}
    </div>
  );
};

export default DashboardPage;
