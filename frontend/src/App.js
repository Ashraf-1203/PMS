import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'; // Tailwind is imported via index.css

import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import PapersMasterListPage from './pages/papers/PapersMasterListPage';
import MachineEntryPage from './pages/papers/MachineEntryPage';
import BranchListPage from './pages/branches/BranchListPage';
import ReceivePaperPage from './pages/inventory/ReceivePaperPage';
import ConsumePaperPage from './pages/inventory/ConsumePaperPage';
import IssuedPaperPage from './pages/inventory/IssuedPaperPage';
import ReturnedPaperPage from './pages/inventory/ReturnedPaperPage';
import DeckleMatchPage from './pages/papers/DeckleMatchPage';
import AddPaperPage from './pages/papers/AddPaperPage';
import PaperAdjustmentPage from './pages/papers/PaperAdjustmentPage';
import TransferPaperPage from './pages/inventory/TransferPaperPage';
import PendingTransfersPage from './pages/inventory/PendingTransfersPage';
import RejectPaperPage from './pages/inventory/RejectPaperPage';
import ActivityLogPage from './pages/reports/ActivityLogPage';
import StockReportPage from './pages/reports/StockReportPage';
import TransactionReportPage from './pages/reports/TransactionReportPage';
import UserManagementPage from './pages/admin/UserManagementPage'; // Import the new page
import PermissionManagementPage from './pages/admin/PermissionManagementPage'; // Import the new page

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
          <Route path="/inventory/consume" element={<ConsumePaperPage />} />
          <Route path="/inventory/receive" element={<ReceivePaperPage />} />
          <Route path="/inventory/reject" element={<RejectPaperPage />} />
          <Route path="/inventory/transfer" element={<TransferPaperPage />} />
          <Route path="/inventory/pending-transfers" element={<PendingTransfersPage />} />
          <Route path="/inventory/issued" element={<GenericPage title="Issued Paper List" />} />
          <Route path="/inventory/returned" element={<GenericPage title="Returned Paper List" />} />

          {/* Papers Routes */}
          <Route path="/papers/add" element={<AddPaperPage />} />
          <Route path="/papers/list" element={<PapersMasterListPage />} />
          <Route path="/papers/rates" element={<GenericPage title="Rate Management" />} />
          <Route path="/papers/adjustment" element={<PaperAdjustmentPage />} />
          <Route path="/papers/machines" element={<MachineEntryPage />} />
          <Route path="/papers/deckle-match" element={<DeckleMatchPage />} />

          {/* Branch Management Routes */}
          <Route path="/branches/list" element={<BranchListPage />} />

          {/* Reports Routes */}
          <Route path="/reports/stock" element={<StockReportPage />} />
          <Route path="/reports/issued" element={<TransactionReportPage reportType="Issued" title="Issued Report" />} />
          <Route path="/reports/returned" element={<TransactionReportPage reportType="Returned" title="Returned Report" />} />
          <Route path="/reports/transfer" element={<TransactionReportPage reportType="Transfer" title="Transfer Report" />} />
          <Route path="/reports/rejected" element={<TransactionReportPage reportType="Rejected" title="Rejected Report" />} />
          <Route path="/reports/consumed" element={<TransactionReportPage reportType="Consumed" title="Consumed Report" />} />
          <Route path="/reports/receive" element={<TransactionReportPage reportType="Receive" title="Receive Report" />} />
          <Route path="/reports/activity-log" element={<ActivityLogPage />} />

          {/* Administration Routes */}
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/permissions" element={<PermissionManagementPage />} />
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
