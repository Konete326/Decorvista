import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">DecorVista</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/products" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600">
                Products
              </Link>
              <Link to="/gallery" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600">
                Gallery
              </Link>
              <Link to="/designers" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600">
                Designers
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 text-xs text-white flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Products</Link>
            <Link to="/gallery" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Gallery</Link>
            <Link to="/designers" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Designers</Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">
                  Cart ({getCartCount()})
                </Link>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Login</Link>
                <Link to="/register" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
