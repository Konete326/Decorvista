import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminCategoryManagement from './AdminCategoryManagement';
import AdminDesignerManagement from './AdminDesignerManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminProfileManagement from './AdminProfileManagement';

const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeDesigners: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await adminAPI.getReports();
      const data = response.data.data;
      setReports(data);
      setMetrics({
        totalUsers: data?.users?.total ?? 0,
        totalProducts: data?.products ?? 0,
        activeDesigners: data?.designers ?? 0,
        totalOrders: data?.orders ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Active Designers</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.activeDesigners}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {reports?.monthlyData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reports.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" />
              <Bar dataKey="consultations" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Order Management Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Management</h3>
          <AdminOrderManagement />
        </div>
      </div>

      {/* Profile Management Section */}
      <div className="mt-8">
        <AdminProfileManagement />
      </div>

      {/* Management Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminCategoryManagement />
        <AdminDesignerManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
