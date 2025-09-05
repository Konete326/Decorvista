const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;
