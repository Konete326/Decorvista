const Review = require('../models/Review');
const Product = require('../models/Product');
const Designer = require('../models/Designer');
const { body } = require('express-validator');

const getReviews = async (req, res, next) => {
  try {
    const { targetType, targetId, page = 1, limit = 10 } = req.query;
    const queryObj = {};

    if (targetType) queryObj.targetType = targetType;
    if (targetId) queryObj.targetId = targetId;

    const reviews = await Review.find(queryObj)
      .populate('author', 'name avatarUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const total = await Review.countDocuments(queryObj);

    res.json({
      success: true,
      data: reviews,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    const existingReview = await Review.findOne({
      author: req.user.id,
      targetType,
      targetId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    if (targetType === 'product') {
      const product = await Product.findById(targetId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    } else if (targetType === 'designer') {
      const designer = await Designer.findById(targetId);
      if (!designer) {
        return res.status(404).json({
          success: false,
          message: 'Designer not found'
        });
      }
    }

    const review = await Review.create({
      author: req.user.id,
      targetType,
      targetId,
      rating,
      comment
    });

    await updateRating(targetType, targetId);

    await review.populate('author', 'name avatarUrl');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const updateRating = async (targetType, targetId) => {
  const reviews = await Review.find({ targetType, targetId });
  const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

  if (targetType === 'product') {
    await Product.findByIdAndUpdate(targetId, { rating: avgRating });
  } else if (targetType === 'designer') {
    await Designer.findByIdAndUpdate(targetId, { rating: avgRating });
  }
};

const validateCreateReview = [
  body('targetType').isIn(['product', 'designer']).withMessage('Invalid target type'),
  body('targetId').isMongoId().withMessage('Valid target ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
];

module.exports = {
  getReviews,
  createReview,
  validateCreateReview
};
