import React, { useState, useEffect } from 'react';
import AdminAuth from './AdminAuth';
import AdminDashboard from './AdminDashboard';


const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const authData = localStorage.getItem('admin_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const now = Date.now();
          
          // Check if authentication is still valid
          if (parsed.authenticated && parsed.expires > now) {
            setIsAuthenticated(true);
          } else {
            // Remove expired authentication
            localStorage.removeItem('admin_auth');
          }
        } catch (error) {
          // Remove invalid authentication data
          localStorage.removeItem('admin_auth');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminPanel;
