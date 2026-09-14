const express = require('express');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply JWT authentication to all employee routes
router.use(protect);

router
  .route('/')
  .get(getEmployees)
  .post(authorize('admin'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
