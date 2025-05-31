import express from 'express';
import { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  searchEmployees
} from '../controllers/employeeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Route: /api/employees
router.route('/')
  .get(protect, getEmployees)
  .post(protect, upload.single('profilePicture'), createEmployee);

// Route: /api/employees/search
router.get('/search', protect, searchEmployees);

// Route: /api/employees/:id
router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, upload.single('profilePicture'), updateEmployee)
  .delete(protect, admin, deleteEmployee);

export default router;
