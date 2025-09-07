const { validationResult, body } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  body('targetId').isMongoId().withMessage('Valid target ID required'),
  body('targetType').isIn(['product', 'designer']).withMessage('Target type must be product or designer'),
  handleValidationErrors
];

const validateOrder = [
  body('shippingAddress.name').notEmpty().withMessage('Name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').optional().isIn(['cash_on_delivery', 'credit_card', 'bank_transfer']),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('items.*.product').optional().isMongoId().withMessage('Valid product ID required'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.priceAt').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  handleValidationErrors
];

const validateOrderStatus = [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
];

const validateProduct = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category ID required'),
  body('inventory').isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
  handleValidationErrors
];

const validateDesigner = [
  body('professionalTitle').notEmpty().withMessage('Professional title is required'),
  body('bio').isLength({ min: 10 }).withMessage('Bio must be at least 10 characters'),
  body('location').notEmpty().withMessage('Location is required'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  handleValidationErrors
];

const validateConsultation = [
  body('designer').isMongoId().withMessage('Valid designer ID required'),
  body('slot.date').isISO8601().withMessage('Valid date required'),
  body('slot.time').notEmpty().withMessage('Time is required'),
  body('serviceType').isIn(['online', 'in-person']).withMessage('Invalid service type'),
  handleValidationErrors
];

const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  handleValidationErrors
];

const validateFavorite = [
  body('type').isIn(['product', 'designer']).withMessage('Type must be product or designer'),
  body('productId').optional().isMongoId().withMessage('Valid product ID required'),
  body('designerId').optional().isMongoId().withMessage('Valid designer ID required'),
  handleValidationErrors
];

module.exports = { 
  handleValidationErrors, 
  validateReview, 
  validateOrder, 
  validateOrderStatus,
  validateProduct,
  validateDesigner,
  validateConsultation,
  validateCategory,
  validateFavorite
};
