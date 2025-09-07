const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), ...validateCreateProduct, handleValidationErrors, createProduct);
router.put('/:id', protect, authorize('admin'), ...validateUpdateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Product review routes
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, ...validateProductReview, handleValidationErrors, addProductReview);
router.put('/:id/reviews/:reviewId', protect, ...validateProductReview, handleValidationErrors, updateProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

module.exports = router;
