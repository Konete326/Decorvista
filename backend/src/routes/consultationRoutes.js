const express = require('express');
const router = express.Router();
const {
  getConsultations,
  createConsultation,
  updateConsultation,
  validateCreateConsultation,
  validateUpdateConsultation
} = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', protect, getConsultations);
router.post('/', protect, validateCreateConsultation, handleValidationErrors, createConsultation);
router.put('/:id', protect, validateUpdateConsultation, handleValidationErrors, updateConsultation);

module.exports = router;
