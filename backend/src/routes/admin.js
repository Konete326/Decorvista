const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getReports,
  getPendingDesigners,
  approveDesigner,
  rejectDesigner,
  getUsers,
  getOrders,
  updateOrderStatus
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Analytics and reports
router.get('/reports', getReports);

// Designer management
router.get('/designers/pending', getPendingDesigners);
router.put('/designers/:designerId/approve', approveDesigner);
router.put('/designers/:designerId/reject', rejectDesigner);

// User management
router.get('/users', getUsers);

// Order management
router.get('/orders', getOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

module.exports = router;
