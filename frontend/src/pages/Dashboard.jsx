import React from 'react';
import { useAuth } from '../context/AuthContext';
import HomeownerDashboard from '../components/HomeownerDashboard';
import DesignerDashboard from '../components/DesignerDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Dashboard = () => {
  const { user, isAdmin, isDesigner, isHomeowner } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isDesigner) {
    return <DesignerDashboard />;
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
