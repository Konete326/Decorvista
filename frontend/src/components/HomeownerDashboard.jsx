import React, { useState, useEffect } from 'react';
import { consultationAPI, productAPI, orderAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const HomeownerDashboard = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const [consultations, setConsultations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consultRes, productRes, orderRes, favoriteRes] = await Promise.all([
        consultationAPI.getAll(),
        productAPI.getAll({ limit: 4 }),
        orderAPI.getAll(),
        favoriteAPI.getAll()
      ]);
      setConsultations(consultRes.data.data);
      setRecentProducts(productRes.data.data);
      setOrders(orderRes.data.data);
      setFavorites(favoriteRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
      <p className="text-gray-600 mb-8">Here's what's happening with your DecorVista account.</p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Items in Cart</p>
              <p className="text-2xl font-semibold text-gray-900">{cart.items.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Consultations</p>
              <p className="text-2xl font-semibold text-gray-900">{consultations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm">Saved Items</p>
              <p className="text-2xl font-semibold text-gray-900">{favorites.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders placed yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <div key={order._id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">Order #{order._id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} - {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Your Consultations</h2>
          </div>
          <div className="p-6">
            {consultations.length === 0 ? (
              <p className="text-gray-500">No consultations scheduled</p>
            ) : (
              <div className="space-y-4">
                {consultations.slice(0, 3).map(consultation => (
                  <div key={consultation._id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{consultation.designer?.user?.name || 'Designer'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(consultation.slot.date).toLocaleDateString()} at {consultation.slot.time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      consultation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      consultation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {consultation.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/products" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
            <svg className="h-8 w-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <p className="font-medium">Browse Products</p>
              <p className="text-sm text-gray-600">Explore our catalog</p>
            </div>
          </a>
          
          <a href="/designers" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
            <svg className="h-8 w-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div>
              <p className="font-medium">Find Designers</p>
              <p className="text-sm text-gray-600">Book consultations</p>
            </div>
          </a>
          
          <a href="/gallery" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
            <svg className="h-8 w-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium">View Gallery</p>
              <p className="text-sm text-gray-600">Get inspired</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeownerDashboard;
