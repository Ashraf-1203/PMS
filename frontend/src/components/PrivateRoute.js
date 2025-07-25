import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ user, redirectPath = '/login' }) => {
  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated, render the child routes/component
  // Outlet is used to render child routes for nested routing scenarios
  return <Outlet />;
};

export default PrivateRoute;
