import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// This component will wrap pages that need the standard Navbar and Sidebar
const MainLayout = ({ children, user, onLogout, userPermissions }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar userName={user?.fullName || user?.username} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userPermissions={userPermissions} />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {/* Content goes here */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
