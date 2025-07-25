const express = require('express');
const router = express.Router();
const {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
} = require('../controllers/branchController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protect);

// Routes for the Branch Management page
router.route('/')
    .get(getBranches) // The getBranches for dropdowns is open to all logged in users. The management page will also use this.
    .post(checkPermission('branchList', 'add'), createBranch);

router.route('/:id')
    .put(checkPermission('branchList', 'edit'), updateBranch)
    .delete(checkPermission('branchList', 'delete'), deleteBranch);

module.exports = router;
