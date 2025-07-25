const express = require('express');
const router = express.Router();
const { getAllActivities, getHistoryForTarget } = require('../controllers/activityLogController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(checkPermission('activityLog', 'view'), getAllActivities);

router.route('/history/:targetEntity/:targetId')
    .get(getHistoryForTarget); // Assuming if you can view the list, you can view history.

module.exports = router;
