import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import HomeownerDashboard from '../components/HomeownerDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  const isAdmin = user?.role === 'admin';
  const isDesigner = user?.role === 'designer';
  const isHomeowner = user?.role === 'homeowner';

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isDesigner) {
    return <Navigate to="/designer-dashboard" replace />;
  }

  if (isHomeowner) {
    return <HomeownerDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome, {user?.name}!</p>
    </div>
  );
};

export default Dashboard;
