const express = require('express');
const multer = require('multer');
const {
  getAllUserProfiles,
  getUserProfile,
  getMyProfile,
  createOrUpdateProfile,
  updateUserProfile,
  addProjectHistory,
  getUserReviews
} = require('../controllers/userProfileController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Get all user profiles (admin only)
router.get('/', protect, authorize('admin'), getAllUserProfiles);

// Get current user's profile
router.get('/me', protect, getMyProfile);

// Create or update current user's profile
router.put('/me', protect, createOrUpdateProfile);

// Add project to history
router.post('/me/projects', protect, addProjectHistory);

// Get user profile by ID (public)
router.get('/:userId', getUserProfile);

// Update user profile by ID (with image upload)
router.put('/:userId', protect, upload.single('profileImage'), updateUserProfile);

// Get user reviews
router.get('/:userId/reviews', getUserReviews);

module.exports = router;
