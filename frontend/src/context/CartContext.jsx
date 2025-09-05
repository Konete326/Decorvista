import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await cartAPI.add({ productId, quantity });
      setCart(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (items) => {
    try {
      setLoading(true);
      const response = await cartAPI.update({ items });
      setCart(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    return updateCartItem([{ productId, quantity: 0 }]);
  };

  const checkout = async () => {
    try {
      setLoading(true);
      await cartAPI.checkout();
      setCart({ items: [] });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.priceAt * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    checkout,
    getCartTotal,
    getCartCount,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
