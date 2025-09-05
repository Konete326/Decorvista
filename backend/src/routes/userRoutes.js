const express = require('express');
const router = express.Router();
const {
  getMe,
  updateMe,
  validateUpdateMe,
  getAllUsers,
  updateUserStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/me', protect, getMe);
router.put('/me', protect, validateUpdateMe, handleValidationErrors, updateMe);

// Admin routes
router.get('/all', protect, getAllUsers);
router.put('/:userId/status', protect, updateUserStatus);

module.exports = router;
