const express = require('express');
const router = express.Router();
const {
    initiateTransfer,
    approveTransfer,
    getPendingTransfers,
} = require('../controllers/transferController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);

// Permission for initiating a transfer could be on 'transferPaper' page
router.post('/initiate', checkPermission('transferPaper', 'add'), initiateTransfer);

// Permission for approving could be on a special 'transferApproval' page or role-based
router.post('/:id/approve', checkPermission('transferPaper', 'approve'), approveTransfer);

router.get('/pending', checkPermission('transferPaper', 'view'), getPendingTransfers);

module.exports = router;
