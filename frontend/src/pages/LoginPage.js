import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
// import { LockClosedIcon, UserIcon } from '@heroicons/react/solid'; // Example for icons

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Admin setup form state
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminFullName, setAdminFullName] = useState('Administrator');
  const [adminEmail, setAdminEmail] = useState('admin@pms.local');
  const [adminSetupLoading, setAdminSetupLoading] = useState(false);
  const [adminSetupError, setAdminSetupError] = useState('');


  // Simple animation effect for the form
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!username || !password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.login({ username, password });
      onLoginSuccess(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetupSubmit = async (e) => {
    e.preventDefault();
    setAdminSetupError('');
    setSuccessMessage('');
    setAdminSetupLoading(true);
    try {
        const data = await authService.setupAdmin({
            username: adminUsername,
            password: adminPassword,
            fullName: adminFullName,
            email: adminEmail
        });
        setSuccessMessage(data.message || 'Admin user created successfully! You can now login.');
        setShowAdminSetup(false); // Hide the form
        // Clear admin form fields
        setAdminUsername('admin');
        setAdminPassword('admin123');
        setAdminFullName('Administrator');
        setAdminEmail('admin@pms.local');
    } catch (err) {
        setAdminSetupError(err.message || 'Admin setup failed.');
    } finally {
        setAdminSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-sky-700 to-blue-600 p-4 overflow-hidden relative">
      {/* Animated background shapes (optional) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`
            }}
          ></div>
        ))}
      </div>

      <div
        className={`bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md z-10
                    transform transition-all duration-700 ease-out
                    ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
          Paper Management System
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {showAdminSetup ? 'Setup Initial Admin User' : 'Welcome Back! Please Login.'}
        </p>

        {error && <p className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md mb-4 text-sm transition-opacity duration-300">{error}</p>}
        {successMessage && <p className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-md mb-4 text-sm transition-opacity duration-300">{successMessage}</p>}
        {adminSetupError && <p className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md mb-4 text-sm transition-opacity duration-300">{adminSetupError}</p>}

        {!showAdminSetup ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* <UserIcon className="h-5 w-5 text-gray-400" /> */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                </div>
                <input
                  id="username" name="username" type="text" autoComplete="username" required
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow hover:shadow-md"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* <LockClosedIcon className="h-5 w-5 text-gray-400" /> */}
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow hover:shadow-md"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                Sign In
              </button>
            </div>
            <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={() => { setShowAdminSetup(true); setError(''); setSuccessMessage(''); }}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                    First time setup? Create Admin User
                </button>
            </div>
          </form>
        ) : (
          // Admin Setup Form
          <form onSubmit={handleAdminSetupSubmit} className="space-y-4">
            {/* Admin Username, Password, FullName, Email inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Username</label>
              <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Password (min 6 chars)</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required minLength="6"
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={adminFullName} onChange={e => setAdminFullName(e.target.value)} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
            <div className="flex items-center space-x-3">
              <button type="submit" disabled={adminSetupLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300">
                {adminSetupLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                Create Admin
              </button>
              <button type="button" onClick={() => { setShowAdminSetup(false); setAdminSetupError(''); }}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>

      <footer className="absolute bottom-4 text-center w-full z-10">
        <p className="text-sm text-white/70">&copy; {new Date().getFullYear()} Paper Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
