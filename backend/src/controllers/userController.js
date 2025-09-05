const User = require('../models/User');
const { body } = require('express-validator');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatarUrl },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const validateUpdateMe = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number'),
  body('avatarUrl').optional().isURL().withMessage('Invalid URL')
];

module.exports = {
  getMe,
  updateMe,
  validateUpdateMe
};
