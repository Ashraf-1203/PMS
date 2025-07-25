const express = require('express');
const router = express.Router();
const { getStockReport, getTransactionReport } = require('../controllers/reportController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);

// Assuming a generic 'view' permission on each report's pageKey
router.get('/stock', checkPermission('stockReport', 'view'), getStockReport);
router.get('/transactions/:transactionType', getTransactionReport); // Permissions will be checked on the frontend page access

// TODO: Add other specific report routes if needed

module.exports = router;
