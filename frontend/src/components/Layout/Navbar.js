import React from 'react';
import { Link } from 'react-router-dom';
// import { BellIcon } from '@heroicons/react/outline'; // Example, if using Heroicons

const Navbar = ({ userName, onLogout }) => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-xl font-bold">
              {/* <img className="h-8 w-auto" src="/path/to/logo.png" alt="PMS Logo" /> */}
              PMS
            </Link>
          </div>
          <div className="flex items-center">
            {/* Notification Icon Placeholder */}
            <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white mr-4">
              <span className="sr-only">View notifications</span>
              {/* <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>

            {userName ? (
              <>
                <span className="mr-4">Welcome, {userName}</span>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
