import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: `${API_URL}/user-profiles`
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userProfileAPI = {
  // Get all user profiles (admin only)
  getAll: (params = {}) => api.get('/', { params }),
  
  // Get current user's profile
  getMyProfile: () => api.get('/me'),
  
  // Create or update current user's profile
  updateMyProfile: (data) => api.put('/me', data),
  
  // Update user profile by ID (with image upload support)
  updateUserProfile: (userId, data) => {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return api.put(`/${userId}`, data, config);
  },
  
  // Add project to history
  addProject: (data) => api.post('/me/projects', data),
  
  // Get user profile by ID
  getUserProfile: (userId) => api.get(`/${userId}`),
  
  // Get user reviews
  getUserReviews: (userId, params = {}) => api.get(`/${userId}/reviews`, { params })
};

export default userProfileAPI;
