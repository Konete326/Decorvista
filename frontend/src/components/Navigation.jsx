import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navigation = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'admin';
  const isDesigner = user?.role === 'designer';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">DecorVista</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/products" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Products
              </Link>
              <Link to="/designers" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Designers
              </Link>
              <Link to="/gallery" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Gallery
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {items.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
                      <span>Admin</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                      <Link to="/admin?tab=users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        User Management
                      </Link>
                      <Link to="/admin?tab=orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Order Management
                      </Link>
                      <Link to="/admin?tab=designers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Designer Approvals
                      </Link>
                      <Link to="/admin?tab=categories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Categories
                      </Link>
                      <Link to="/admin/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Manage Products
                      </Link>
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
                    <span>{user?.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    {/* Admin-specific links moved to dedicated Admin dropdown above */}
                    {isDesigner && (
                      <Link to="/complete-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Update Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
