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
    return response.data;
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
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update profile');
    }
  },

  updatePassword: async (passwordData) => {
    const response = await apiClient.put('/auth/password', passwordData);
    if (response.success) {
      return response;
    } else {
      throw new Error(response.message || 'Failed to update password');
    }
  },

  deleteAccount: async (passwordData) => {
    const response = await apiClient.delete('/auth/account', { data: passwordData });
    if (response.success) {
      return response;
    } else {
      throw new Error(response.message || 'Failed to delete account');
    }
  },

  // Product methods
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    if (response.success && response.data) {
      return response.data;
    } else if (response.products) {
      return response;
    } else if (Array.isArray(response)) {
      return { products: response };
    }
    return { products: [] };
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    if (Array.isArray(response)) {
      return response;
    } else if (response.categories) {
      return response.categories;
    } else if (response.data) {
      return response.data;
    }
    return [];
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
  try {
    const response = await apiClient.get('/orders');
    
    console.log('Orders API response:', response); // Debug log
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response; // Direct array from MongoDB
    } else if (response && Array.isArray(response.data)) {
      return response.data; // { data: [] } format
    } else if (response && response.orders) {
      return response.orders; // { orders: [] } format
    } else if (response && response.success && Array.isArray(response.data)) {
      return response.data; // { success: true, data: [] } format
    }
    
    console.warn('Unexpected orders response format:', response);
    return [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
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