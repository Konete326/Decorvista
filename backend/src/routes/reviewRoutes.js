const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  validateCreateReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', getReviews);
router.post('/', protect, validateCreateReview, handleValidationErrors, createReview);

module.exports = router;
