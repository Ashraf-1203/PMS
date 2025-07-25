import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'; // Tailwind is imported via index.css

import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';

// Placeholder for other pages
const GenericPage = ({ title }) => <div className="p-5"><h1 className="text-2xl">{title}</h1><p>Content for {title} will be here.</p></div>;

function App() {
  // Basic auth state - in a real app, this would be in a context or Redux/Zustand
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session (e.g., token in localStorage)
    const storedUser = localStorage.getItem('pmsUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('pmsUser');
      }
    }
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('pmsUser', JSON.stringify(userData)); // Persist user
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pmsUser'); // Clear persisted user
    // navigate to login or home page if needed, PrivateRoute will handle redirection
  };

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-700">Loading Application...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!currentUser ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />}
        />

        {/* Routes that use MainLayout and require authentication */}
        <Route
          element={
            <PrivateRoute user={currentUser}>
              <MainLayout user={currentUser} onLogout={handleLogout} userPermissions={currentUser?.permissions}>
                {/* Outlet will be rendered here by PrivateRoute if user is authenticated */}
              </MainLayout>
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Inventory Routes */}
          <Route path="/inventory/consume" element={<GenericPage title="Consume Paper" />} />
          <Route path="/inventory/receive" element={<GenericPage title="Receive Paper" />} />
          <Route path="/inventory/reject" element={<GenericPage title="Reject Paper" />} />
          <Route path="/inventory/transfer" element={<GenericPage title="Transfer Paper" />} />
          <Route path="/inventory/issued" element={<GenericPage title="Issued Paper List" />} />
          <Route path="/inventory/returned" element={<GenericPage title="Returned Paper List" />} />

          {/* Papers Routes */}
          <Route path="/papers/add" element={<GenericPage title="Add Paper Master" />} />
          <Route path="/papers/list" element={<GenericPage title="Papers Master List" />} />
          <Route path="/papers/rates" element={<GenericPage title="Rate Management" />} />
          <Route path="/papers/adjustment" element={<GenericPage title="Paper Adjustment" />} />
          <Route path="/papers/machines" element={<GenericPage title="Machine Entry" />} />
          <Route path="/papers/deckle-match" element={<GenericPage title="Deckle Match" />} />

          {/* Branch Management Routes */}
          <Route path="/branches/list" element={<GenericPage title="Branch List" />} />

          {/* Reports Routes */}
          <Route path="/reports/stock" element={<GenericPage title="Stock Report" />} />
          <Route path="/reports/issued" element={<GenericPage title="Issued Report" />} />
          <Route path="/reports/returned" element={<GenericPage title="Returned Report" />} />
          <Route path="/reports/transfer" element={<GenericPage title="Transfer Report" />} />
          <Route path="/reports/rejected" element={<GenericPage title="Rejected Report" />} />
          <Route path="/reports/consumed" element={<GenericPage title="Consumed Report" />} />
          <Route path="/reports/receive" element={<GenericPage title="Receive Report" />} />
          <Route path="/reports/activity-log" element={<GenericPage title="Activity Log" />} />

          {/* Administration Routes */}
          <Route path="/admin/users" element={<GenericPage title="User Management" />} />
          <Route path="/admin/permissions" element={<GenericPage title="Permission Management" />} />
          <Route path="/admin/history" element={<GenericPage title="System History" />} />

          {/* Default authenticated route redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback for non-authenticated users trying to access root or unknown paths */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
