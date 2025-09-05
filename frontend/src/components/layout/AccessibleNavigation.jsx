import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  PhotoIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  HeartIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { toggleMobileMenu } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import ScreenReaderOnly from '../ui/ScreenReaderOnly';
import useFocusTrap from '../../hooks/useFocusTrap';

const AccessibleNavigation = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { isMobileMenuOpen } = useSelector((state) => state.ui);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const mobileMenuRef = useFocusTrap(isMobileMenuOpen);
  const userMenuRef = useRef(null);

  const navigationItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
    { name: 'Designers', href: '/designers', icon: UserGroupIcon },
  ];

  const userMenuItems = user ? [
    { name: 'Dashboard', href: '/dashboard', icon: Cog6ToothIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
    { name: 'Consultations', href: '/consultations', icon: CalendarDaysIcon },
    ...(user.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Cog6ToothIcon }] : []),
  ] : [];

  const isCurrentPage = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleMobileMenuToggle = () => {
    dispatch(toggleMobileMenu());
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Close menus on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          dispatch(toggleMobileMenu());
        }
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen, isUserMenuOpen, dispatch]);

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
              aria-label="DecorVista - Go to homepage"
            >
              <span className="text-2xl font-bold text-primary-600">DecorVista</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4" role="menubar">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const current = isCurrentPage(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    role="menuitem"
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      ${current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }
                    `}
                    aria-current={current ? 'page' : undefined}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  onClick={handleUserMenuToggle}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                    alt={`${user.name} avatar`}
                  />
                  <ScreenReaderOnly>Open user menu</ScreenReaderOnly>
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-1">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            role="menuitem"
                            className="group flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:bg-neutral-100 focus:text-neutral-900"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-3 text-neutral-400 group-hover:text-neutral-500" aria-hidden="true" />
                            {item.name}
                          </Link>
                        );
                      })}
                      <div className="border-t border-neutral-100">
                        <button
                          role="menuitem"
                          className="group flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:bg-neutral-100 focus:text-neutral-900"
                          onClick={() => {
                            // Handle logout
                            setIsUserMenuOpen(false);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={handleMobileMenuToggle}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <ScreenReaderOnly>
                  {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                </ScreenReaderOnly>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden bg-white border-t border-neutral-200"
          ref={mobileMenuRef}
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPage(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  role="menuitem"
                  className={`
                    flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${current
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }
                  `}
                  aria-current={current ? 'page' : undefined}
                  onClick={handleMobileMenuToggle}
                >
                  <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
            
            {user && (
              <>
                <div className="border-t border-neutral-200 pt-4">
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        role="menuitem"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={handleMobileMenuToggle}
                      >
                        <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default AccessibleNavigation;
