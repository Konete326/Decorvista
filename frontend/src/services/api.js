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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data)
};

export const designerAPI = {
  getAll: (params) => api.get('/designers', { params }),
  getById: (id) => api.get(`/designers/${id}`),
  getMe: () => api.get('/designers/me'),
  create: (data) => api.post('/designers', data),
  update: (id, data) => api.put(`/designers/${id}`, data)
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data)
};

export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  create: (data) => api.post('/gallery', data)
};

export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (id) => api.delete(`/favorites/${id}`)
};

export const consultationAPI = {
  getAll: (params) => api.get('/consultations', { params }),
  create: (data) => api.post('/consultations', data),
  update: (id, data) => api.put(`/consultations/${id}`, data)
};

export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data)
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (data) => api.put('/cart', data)
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data)
};

export const adminAPI = {
  getReports: () => api.get('/admin/reports'),
  getPendingDesigners: () => api.get('/admin/designers/pending'),
  approveDesigner: (designerId) => api.put(`/admin/designers/${designerId}/approve`),
  rejectDesigner: (designerId, data) => api.put(`/admin/designers/${designerId}/reject`, data)
};

export const uploadAPI = {
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

export const userAPI = {
  getAll: (params) => api.get('/users/all', { params }),
  updateStatus: (userId, data) => api.put(`/users/${userId}/status`, data)
};

export default api;
