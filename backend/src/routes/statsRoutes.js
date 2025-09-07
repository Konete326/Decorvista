const express = require('express');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

// GET /api/stats - Get platform statistics
router.get('/', getStats);

module.exports = router;
