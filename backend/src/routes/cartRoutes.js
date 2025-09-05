const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCart,
  checkout,
  validateAddToCart,
  validateUpdateCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', protect, getCart);
router.post('/', protect, validateAddToCart, handleValidationErrors, addToCart);
router.put('/', protect, validateUpdateCart, handleValidationErrors, updateCart);
router.post('/checkout', protect, checkout);

module.exports = router;
