const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  validateAddFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', protect, getFavorites);
router.post('/', protect, validateAddFavorite, handleValidationErrors, addFavorite);
router.delete('/:id', protect, removeFavorite);

module.exports = router;
