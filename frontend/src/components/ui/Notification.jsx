import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { markAsRead, removeNotification } from '../../store/slices/notificationSlice';
import Button from './Button';

const NotificationCenter = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notification);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-success-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-error-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-primary-500" />;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleRemove = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center">
              <BellIcon className="w-6 h-6 text-neutral-600 mr-2" />
              <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-error-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <BellIcon className="w-12 h-12 mb-4 text-neutral-300" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`
                        px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer
                        ${!notification.read ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''}
                      `}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {notification.title && (
                                <p className="text-sm font-medium text-neutral-900 mb-1">
                                  {notification.title}
                                </p>
                              )}
                              <p className="text-sm text-neutral-600">
                                {notification.message}
                              </p>
                              <p className="text-xs text-neutral-400 mt-1">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(notification.id);
                              }}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove notification"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationCenter;
