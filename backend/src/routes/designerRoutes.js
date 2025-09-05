const express = require('express');
const router = express.Router();
const {
  getDesigners,
  getDesigner,
  getMyDesignerProfile,
  createDesigner,
  updateDesigner,
  validateCreateDesigner,
  validateUpdateDesigner
} = require('../controllers/designerController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

router.get('/', getDesigners);
router.get('/me', protect, getMyDesignerProfile);
router.get('/:id', getDesigner);
router.post('/', protect, authorize('designer', 'admin'), validateCreateDesigner, handleValidationErrors, createDesigner);
router.put('/:id', protect, validateUpdateDesigner, handleValidationErrors, updateDesigner);

module.exports = router;
