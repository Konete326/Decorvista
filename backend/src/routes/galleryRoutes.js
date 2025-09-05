const express = require('express');
const router = express.Router();
const {
  getGalleryItems,
  createGalleryItem,
  validateCreateGalleryItem
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', getGalleryItems);
router.post('/', protect, authorize('admin', 'designer'), validateCreateGalleryItem, handleValidationErrors, createGalleryItem);

module.exports = router;
