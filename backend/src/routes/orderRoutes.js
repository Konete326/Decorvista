const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(validateOrder, createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById)
  .put(authorize('admin'), validateOrderStatus, updateOrderStatus);

module.exports = router;
