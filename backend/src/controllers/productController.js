const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');
const { body, query, validationResult } = require('express-validator');
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

// Add product review
const addProductReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReviewIndex = product.reviews.findIndex(
      review => review.user.toString() === userId.toString()
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment;
      product.reviews[existingReviewIndex].updatedAt = new Date();
    } else {
      // Add new review
      product.reviews.push({
        user: userId,
        rating,
        comment
      });
    }

    // Update product rating and review count
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.reviewCount = product.reviews.length;

    await product.save();

    // Populate the new review with user data
    await product.populate('reviews.user', 'name avatarUrl');

    const reviewData = existingReviewIndex !== -1 
      ? product.reviews[existingReviewIndex]
      : product.reviews[product.reviews.length - 1];

    res.status(201).json({
      success: true,
      message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
      data: reviewData
    });
  } catch (error) {
    console.error('Add product review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate('reviews.user', 'name avatarUrl')
      .select('reviews rating reviewCount');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Sort reviews by newest first
    const sortedReviews = product.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        rating: product.rating,
        reviewCount: product.reviewCount,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(sortedReviews.length / limit),
          total: sortedReviews.length
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Update product review
const updateProductReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const productId = req.params.id;
    const reviewId = req.params.reviewId;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;

    // Recalculate product rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();
    await product.populate('reviews.user', 'name avatarUrl');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update product review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete product review
const deleteProductReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviewId = req.params.reviewId;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Remove review
    product.reviews.pull(reviewId);

    // Recalculate product rating and count
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = totalRating / product.reviews.length;
    } else {
      product.rating = 0;
    }
    product.reviewCount = product.reviews.length;

    await product.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete product review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Validation for product reviews
const validateProductReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductReview
};
