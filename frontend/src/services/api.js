import axios from 'axios';

// Base URL for the API. Consider moving to .env file for different environments.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('pmsUser'));
    if (user && user.token) {
      config.headers['Authorization'] = \`Bearer ${user.token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for responses, specifically to handle 401 errors (e.g., token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be invalid or expired
      console.warn('Unauthorized (401) response from API. Token might be invalid or expired.');
      // Clear user from localStorage and redirect to login
      // This logic might be better handled in a global auth context or App.js
      // For now, just logging it. A robust solution would involve redirecting.
      // localStorage.removeItem('pmsUser');
      // window.location.href = '/login'; // Force redirect
    }
    return Promise.reject(error);
  }
);


export default apiClient;
