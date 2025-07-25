const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUser,
    getRoles,
} = require('../controllers/userController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.use(protect);
router.use(checkPermission('userManagement', 'view')); // Base permission for this whole section

router.route('/')
    .get(getUsers);

router.route('/roles')
    .get(getRoles);

router.route('/:id')
    .put(checkPermission('userManagement', 'edit'), updateUser);

module.exports = router;
