const express = require('express');
const {
  getMaintenanceLogs,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMaintenanceLogs)
  .post(authorize('admin'), createMaintenance);

router
  .route('/:id')
  .get(getMaintenanceById)
  .put(authorize('admin'), updateMaintenance)
  .delete(authorize('admin'), deleteMaintenance);

module.exports = router;
