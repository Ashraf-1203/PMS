const express = require('express');
const router = express.Router();
const {
    getPermissions,
    getPermissionMatrix,
    updatePermissions,
} = require('../controllers/permissionController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkPermission('permissionManagement', 'view'));

router.route('/')
    .get(getPermissions);

router.route('/matrix')
    .get(getPermissionMatrix);

router.route('/:roleId')
    .post(checkPermission('permissionManagement', 'manage_permissions'), updatePermissions);

module.exports = router;
