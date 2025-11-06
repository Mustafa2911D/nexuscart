// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexuscart-backend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data; // Return only the data part
  },
  (error) => {
    // Handle errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Network error occurred';
    
    console.error('API Error:', {
      message: errorMessage,
      status: error.response?.status,
      url: error.config?.url
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Enhanced API methods with better error handling
export const api = {
  // Auth methods
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  getProfile: async () => {
    return await apiClient.get('/auth/profile');
  },

  updateProfile: async (userData) => {
    return await apiClient.put('/auth/profile', userData);
  },

  updatePassword: async (passwordData) => {
    return await apiClient.put('/auth/password', passwordData);
  },

  deleteAccount: async (passwordData) => {
    return await apiClient.delete('/auth/account', { data: passwordData });
  },

  // Product methods
  getProducts: async (params = {}) => {
    return await apiClient.get('/products', { params });
  },

  getProduct: async (id) => {
    return await apiClient.get(`/products/${id}`);
  },

  getCategories: async () => {
    return await apiClient.get('/products/categories');
  },

  // Cart methods
  getCart: async () => {
    return await apiClient.get('/cart');
  },

  addToCart: async (item) => {
    return await apiClient.post('/cart/add', item);
  },

  updateCartItem: async (id, quantity) => {
    return await apiClient.put(`/cart/${id}`, { quantity });
  },

  removeFromCart: async (id) => {
    return await apiClient.delete(`/cart/${id}`);
  },

  clearCart: async () => {
    return await apiClient.delete('/cart');
  },

  checkout: async (orderData) => {
    return await apiClient.post('/cart/checkout', orderData);
  },

  // Order methods
  createOrder: async (orderData) => {
    return await apiClient.post('/orders', orderData);
  },

  getOrders: async () => {
    return await apiClient.get('/orders');
  },

  getOrder: async (id) => {
    return await apiClient.get(`/orders/${id}`);
  },

  // Newsletter methods
  subscribeToNewsletter: async (email) => {
    return await apiClient.post('/newsletter/subscribe', { email });
  },

  // Health check
  healthCheck: async () => {
    return await apiClient.get('/health');
  }
};

export default api;