const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { body } = require('express-validator');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    const category = await Category.create({
      name,
      slug,
      description
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const validateCreateCategory = [
  body('name').trim().notEmpty().isLength({ max: 50 }).withMessage('Name is required and must not exceed 50 characters'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description must not exceed 200 characters')
];

module.exports = {
  getCategories,
  createCategory,
  validateCreateCategory
};
