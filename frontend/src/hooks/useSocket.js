import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification } from '../store/slices/notificationSlice';
import toast from 'react-hot-toast';

const useSocket = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      socketRef.current = io(socketUrl);

      // Join user-specific room
      socketRef.current.emit('join-room', user.id);

      // Join admin room if user is admin
      if (user.role === 'admin') {
        socketRef.current.emit('join-admin');
      }

      // Listen for notifications
      socketRef.current.on('notification', (notification) => {
        dispatch(addNotification(notification));
        
        // Show toast notification
        const toastType = notification.type === 'error' ? 'error' : 
                         notification.type === 'success' ? 'success' : 'default';
        
        toast[toastType](notification.message);
      });

      // Listen for booking updates
      socketRef.current.on('booking-update', (data) => {
        dispatch(addNotification({
          type: 'info',
          title: 'Booking Update',
          message: data.message,
          data: data.booking,
        }));
        toast(data.message);
      });

      // Listen for order updates
      socketRef.current.on('order-update', (data) => {
        dispatch(addNotification({
          type: 'info',
          title: 'Order Update',
          message: data.message,
          data: data.order,
        }));
        toast(data.message);
      });

      // Listen for designer approval updates
      socketRef.current.on('designer-approval', (data) => {
        dispatch(addNotification({
          type: data.approved ? 'success' : 'info',
          title: 'Designer Application Update',
          message: data.message,
          data: data.designer,
        }));
        toast[data.approved ? 'success' : 'default'](data.message);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user, dispatch]);

  const emitEvent = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { socket: socketRef.current, emitEvent };
};

export { useSocket };
export default useSocket;
