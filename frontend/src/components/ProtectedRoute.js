import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token, redirige a login
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
