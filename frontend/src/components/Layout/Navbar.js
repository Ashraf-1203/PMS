import React from 'react';
import { Link } from 'react-router-dom';
import Notifications from './Notifications';

const Navbar = ({ userName, onLogout }) => {
  return (
<nav className="bg-gray-800 text-white shadow-lg relative z-20">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-xl font-bold">
              {/* <img className="h-8 w-auto" src="/path/to/logo.png" alt="PMS Logo" /> */}
              PMS
            </Link>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <Notifications />
            </div>

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
