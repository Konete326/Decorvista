const express = require('express');
const { getLikesAnalytics, getSavesAnalytics, getAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/likes - Get likes analytics (admin only)
router.get('/likes', protect, authorize('admin'), getLikesAnalytics);

// GET /api/analytics/saves - Get saves analytics (admin only)
router.get('/saves', protect, authorize('admin'), getSavesAnalytics);

// GET /api/analytics - Get comprehensive analytics (admin only)
router.get('/', protect, authorize('admin'), getAnalytics);

module.exports = router;
