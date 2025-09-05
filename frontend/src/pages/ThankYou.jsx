import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { orderId, orderTotal } = location.state || {};

  useEffect(() => {
    // Clear cart after successful order
    dispatch(clearCart());
  }, [dispatch]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>

            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-lg font-medium text-gray-900">{orderId}</p>
                {orderTotal && (
                  <p className="text-sm text-gray-600 mt-2">
                    Total: <span className="font-medium">${orderTotal}</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleViewOrders}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View My Orders
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Questions about your order? Contact us at{' '}
                <a href="mailto:support@decorvista.com" className="text-indigo-600 hover:text-indigo-500">
                  support@decorvista.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
