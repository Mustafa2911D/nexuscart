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

// Response interceptor - Handle different response structures
apiClient.interceptors.response.use(
  (response) => {
    // If response has data property, return it directly
    // Otherwise return the entire response
    return response.data !== undefined ? response.data : response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Network error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export const api = {
  // Auth methods
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    return response;
  },

  // Product methods - Handle different response structures
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    // If response is already the products array, return it
    // If it's an object with products property, return that
    return Array.isArray(response) ? { products: response } : response;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    return Array.isArray(response) ? response : (response.categories || response);
  },

  // Cart methods
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data || response;
  },

  addToCart: async (item) => {
    const response = await apiClient.post('/cart/add', item);
    return response.data || response;
  },

  updateCartItem: async (id, quantity) => {
    const response = await apiClient.put(`/cart/${id}`, { quantity });
    return response.data || response;
  },

  removeFromCart: async (id) => {
    const response = await apiClient.delete(`/cart/${id}`);
    return response.data || response;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data || response;
  },

  checkout: async (orderData) => {
    const response = await apiClient.post('/cart/checkout', orderData);
    return response.data || response;
  },

  // Order methods
  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return Array.isArray(response) ? response : (response.orders || response);
  },

  getOrder: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response;
  },

  // Newsletter methods
  subscribeToNewsletter: async (email) => {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response;
  }
};

export default api;