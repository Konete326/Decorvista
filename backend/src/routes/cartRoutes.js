const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  checkout,
  validateAddToCart,
  validateUpdateCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', protect, getCart);
router.post('/', protect, validateAddToCart, handleValidationErrors, addToCart);
router.put('/', protect, validateUpdateCart, handleValidationErrors, updateCart);
router.delete('/remove/:productId', protect, removeFromCart);
router.post('/checkout', protect, checkout);

module.exports = router;
