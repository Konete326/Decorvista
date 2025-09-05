import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">DecorVista</h3>
            <p className="text-gray-400 text-sm">
              Connecting homeowners with talented interior designers to create beautiful spaces.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-400 hover:text-white text-sm">Products</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-white text-sm">Gallery</Link></li>
              <li><Link to="/designers" className="text-gray-400 hover:text-white text-sm">Designers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-400 hover:text-white text-sm">Login</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white text-sm">Register</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">Email: info@decorvista.com</p>
            <p className="text-gray-400 text-sm">Phone: (555) 123-4567</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2024 DecorVista. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
