const express = require('express');
const router = express.Router();
const {
    getMachines,
    createMachine,
    updateMachine,
    deleteMachine,
} = require('../controllers/machineController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protect);

// Permission checks are applied per route
router.route('/')
    .get(checkPermission('machineEntry', 'view'), getMachines)
    .post(checkPermission('machineEntry', 'add'), createMachine);

router.route('/:id')
    .put(checkPermission('machineEntry', 'edit'), updateMachine)
    .delete(checkPermission('machineEntry', 'delete'), deleteMachine);

module.exports = router;
