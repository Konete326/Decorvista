const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');
const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const getProducts = async (req, res, next) => {
  try {
    console.log('GET /api/products - Query params:', req.query);
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Number.parseInt(limit, 10) || 12;

    const queryObj = {};

    if (search) {
      queryObj.$text = { $search: search };
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        queryObj.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          queryObj.category = cat._id;
        }
      }
    }

    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = parseFloat(minPrice);
      if (maxPrice) queryObj.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(queryObj)
      .populate('category', 'name slug')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort(sort);

    const total = await Product.countDocuments(queryObj);
    console.log(`Found ${products.length} products, total: ${total}`);
    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    res.json({
      success: true,
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    console.log('Creating product with data:', req.body);
    const { title, ...rest } = req.body;
    const slug = slugify(title) + '-' + Date.now();

    const product = await Product.create({
      title,
      slug,
      ...rest
    });

    console.log('Product created successfully:', product._id);
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { title, ...rest } = req.body;
    const updateData = { ...rest };

    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title) + '-' + Date.now();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const validateCreateProduct = [
  body('title').trim().notEmpty().isLength({ max: 100 }).withMessage('Title is required and must not exceed 100 characters'),
  body('description').trim().notEmpty().isLength({ max: 1000 }).withMessage('Description is required and must not exceed 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('inventory').isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

const validateUpdateProduct = [
  body('title').optional().trim().notEmpty().isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),
  body('description').optional().trim().notEmpty().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('inventory').optional().isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  validateCreateProduct,
  validateUpdateProduct
};
