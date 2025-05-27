import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  }, 
  (error) => {
    // Handle API errors 
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      console.error('Authentication required:', error.response.data.message);
      
      // If the error is due to token expiration and we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Optional: redirect to login
        // window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 