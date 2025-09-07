import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making API request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location?.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data)
};

const designerAPI = {
  getAll: (params) => api.get('/designers', { params }),
  getById: (id) => api.get(`/designers/${id}`),
  getMe: () => api.get('/designers/me'),
  create: (data) => api.post('/designers', data),
  update: (id, data) => api.put(`/designers/${id}`, data)
};

const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  // Product reviews
  getReviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  updateReview: (id, reviewId, data) => api.put(`/products/${id}/reviews/${reviewId}`, data),
  deleteReview: (id, reviewId) => api.delete(`/products/${id}/reviews/${reviewId}`)
};

const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data)
};

const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  create: (data) => api.post('/gallery', data)
};

const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (id) => api.delete(`/favorites/${id}`)
};

const consultationAPI = {
  getAll: (params) => api.get('/consultations', { params }),
  create: (data) => api.post('/consultations', data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  updateStatus: (id, data) => api.put(`/consultations/${id}`, data)
};

const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data)
};

const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (data) => api.put('/cart', data)
};

const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data)
};

const adminAPI = {
  getReports: () => api.get('/admin/reports'),
  getPendingDesigners: () => api.get('/admin/designers/pending'),
  approveDesigner: (designerId) => api.put(`/admin/designers/${designerId}/approve`),
  rejectDesigner: (designerId, data) => api.put(`/admin/designers/${designerId}/reject`, data)
};

const uploadAPI = {
  single: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  multiple: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

const userAPI = {
  getAll: (params) => api.get('/users/all', { params }),
  updateStatus: (userId, data) => api.put(`/users/${userId}/status`, data)
};

import { userProfileAPI } from './userProfileAPI';

const contactAPI = {
  create: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  update: (id, data) => api.put(`/contact/${id}`, data),
  delete: (id) => api.delete(`/contact/${id}`),
  getStats: () => api.get('/contact/stats')
};

export { 
  api, 
  authAPI, 
  productAPI, 
  categoryAPI, 
  cartAPI, 
  orderAPI, 
  designerAPI, 
  consultationAPI, 
  reviewAPI, 
  favoriteAPI, 
  galleryAPI, 
  uploadAPI, 
  userProfileAPI, 
  userAPI, 
  adminAPI,
  contactAPI
};
export default api;
