const express = require('express');
const router = express.Router();
const { 
  getReports,
  getPendingDesigners,
  approveDesigner,
  rejectDesigner,
  getUsers,
  getOrders,
  updateOrderStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/reports', protect, authorize('admin'), getReports);
router.get('/designers/pending', protect, authorize('admin'), getPendingDesigners);
router.put('/designers/:designerId/approve', protect, authorize('admin'), approveDesigner);
router.put('/designers/:designerId/reject', protect, authorize('admin'), rejectDesigner);
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/orders', protect, authorize('admin'), getOrders);
router.put('/orders/:orderId/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
