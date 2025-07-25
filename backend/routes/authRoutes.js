const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  setupAdminUser
} = require('../controllers/authController');
const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');

// @route   POST /api/auth/setup-admin
// @desc    Create the initial admin user if none exists.
// @access  Public (conditional access, controller logic checks if admin exists)
router.post('/setup-admin', setupAdminUser);

// @route   POST /api/auth/register
// @desc    Register a new user. Typically done by an Admin.
// @access  Private, Admin only
// For more granular control: checkPermission('userManagement', 'add')
router.post('/register', protect, authorize(['Admin']), registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get current logged-in user's profile
// @access  Private (any logged-in user can access their own profile)
router.get('/me', protect, getMe);

// Example of a protected route that requires a specific role
router.get('/admin-only-data', protect, authorize(['Admin']), (req, res) => {
  res.json({ message: 'Welcome Admin! This is admin-only data.' });
});

// Example of a protected route that requires a specific permission
router.get('/view-sensitive-reports', protect, checkPermission('stockReport', 'view'), (req, res) => {
    res.json({ message: 'You have permission to view sensitive stock reports.'});
});


module.exports = router;
