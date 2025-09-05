const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  validateCreateProduct,
  validateUpdateProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), ...validateCreateProduct, handleValidationErrors, createProduct);
router.put('/:id', protect, authorize('admin'), ...validateUpdateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
