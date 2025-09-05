const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  validateCreateCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', getCategories);
router.post('/', protect, authorize('admin'), validateCreateCategory, handleValidationErrors, createCategory);

module.exports = router;
