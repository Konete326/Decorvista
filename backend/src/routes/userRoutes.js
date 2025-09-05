const express = require('express');
const router = express.Router();
const {
  getMe,
  updateMe,
  validateUpdateMe
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/me', protect, getMe);
router.put('/me', protect, validateUpdateMe, handleValidationErrors, updateMe);

module.exports = router;
