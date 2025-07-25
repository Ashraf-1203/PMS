import apiClient from './api';

const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      // Save user and token to localStorage (or handle in auth context)
      // App.js currently handles this in handleLoginSuccess
      return response.data;
    } else {
      // Should not happen if backend is consistent
      throw new Error('Login failed: No token received.');
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Login failed. Please try again.';
    console.error('Login error in authService:', error.response?.data || error);
    throw new Error(message);
  }
};

const fetchCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch user profile.';
    console.error('Fetch current user error:', error.response?.data || error);
    // If 401, token is likely invalid/expired. The interceptor might handle some of this.
    // Depending on app flow, might want to clear local storage here too.
    if (error.response?.status === 401) {
        localStorage.removeItem('pmsUser'); // Proactively clear if /me fails with 401
    }
    throw new Error(message);
  }
};

// Setup admin user - only for initial setup if no admin exists
const setupAdmin = async (adminData) => {
    try {
        const response = await apiClient.post('/auth/setup-admin', adminData);
        return response.data; // Expects a success message
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Admin setup failed.';
        console.error('Admin setup error in authService:', error.response?.data || error);
        throw new Error(message);
    }
};


// Example of a register function if admins can create users via UI
// const registerUser = async (userData) => {
//   try {
//     const response = await apiClient.post('/auth/register', userData);
//     return response.data;
//   } catch (error) {
//     const message = error.response?.data?.message || error.message || 'User registration failed.';
//     throw new Error(message);
//   }
// };

const authService = {
  login,
  fetchCurrentUser,
  setupAdmin,
  // registerUser,
};

export default authService;
