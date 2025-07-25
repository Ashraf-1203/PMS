const express = require('express');
const router = express.Router();
const {
    receivePaper,
    consumePaper,
    issuePaper,
    returnPaper,
    calculateReturnRm,
    adjustStock,
    rejectPaper,
} = require('../controllers/inventoryController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protect);

// Route for receiving paper
router.post('/receive', checkPermission('receivePaper', 'add'), receivePaper);

// Route for consuming paper
router.post('/consume', checkPermission('consumePaper', 'add'), consumePaper);

// Route for issuing paper
router.post('/issue', checkPermission('issuedPaperList', 'add'), issuePaper);

// Route for returning paper
router.post('/return', checkPermission('returnedPaperList', 'add'), returnPaper);

// Route for live calculation on the frontend
router.post('/calculate-return-rm', calculateReturnRm);

// Route for adjusting stock
router.post('/adjust', checkPermission('paperAdjustment', 'add'), adjustStock); // 'add' permission seems appropriate

// Route for rejecting paper
router.post('/reject', checkPermission('rejectPaper', 'add'), rejectPaper);


module.exports = router;
