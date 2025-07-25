const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getMyNotifications);

router.post('/read-all', markAllAsRead);

router.post('/:id/read', markAsRead);

module.exports = router;
