// Base API URL - change this to your actual backend URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/signup',
  LOGOUT: '/auth/logout',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Password endpoints
  PASSWORDS: '/passwords/sites',
  ADD_PASSWORD: '/passwords',
  GET_PASSWORD: (id) => `/passwords/${id}`,
  UPDATE_PASSWORD: (id) => `/passwords/${id}`,
  DELETE_PASSWORD: (id) => `/passwords/${id}`,
  
  // User endpoints
  USER_PROFILE: '/user/profile',
  DELETE_ACCOUNT: '/user/delete-account',
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// API request headers with authentication
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Centralized fetch wrapper with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Default options
  const defaultOptions = {
    headers: getAuthHeaders(),
  };
  
  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper functions for common API operations
export const api = {
  // Auth operations
  login: async (email, password) => {
    return apiRequest(ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: async (email, password) => {
    return apiRequest(ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  logout: async () => {
    return apiRequest(ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  },
  
  // Password operations
  getPasswords: async () => {
    return apiRequest(ENDPOINTS.PASSWORDS);
  },
  
  createPassword: async (passwordData) => {
    return apiRequest(ENDPOINTS.PASSWORDS, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },
  
  updatePassword: async (id, passwordData) => {
    return apiRequest(ENDPOINTS.UPDATE_PASSWORD(id), {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
  
  deletePassword: async (id) => {
    return apiRequest(ENDPOINTS.DELETE_PASSWORD(id), {
      method: 'DELETE',
    });
  },
  
  // User operations
  getUserProfile: async () => {
    return apiRequest(ENDPOINTS.USER_PROFILE);
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest(ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  
  deleteAccount: async () => {
    return apiRequest(ENDPOINTS.DELETE_ACCOUNT, {
      method: 'DELETE',
    });
  },
};

export default api; 