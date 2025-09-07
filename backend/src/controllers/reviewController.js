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
      .populate('author', 'name avatarUrl role')
      .populate({
        path: 'targetId',
        select: 'name title user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const total = await Review.countDocuments(queryObj);

    // Add target name to reviews for better display
    const reviewsWithTargetNames = reviews.map(review => {
      let targetName = review.targetId;
      
      if (review.targetType === 'designer' && review.targetId?.user?.name) {
        targetName = review.targetId.user.name;
      } else if (review.targetType === 'product' && review.targetId?.title) {
        targetName = review.targetId.title;
      } else if (review.targetId?.name) {
        targetName = review.targetId.name;
      }
      
      return {
        ...review.toObject(),
        targetName
      };
    });

    res.json({
      success: true,
      data: reviewsWithTargetNames,
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
    const { targetType, targetId, rating, comment, consultation } = req.body;

    // For user/designer reviews, check if consultation exists and is completed (optional for now)
    if (targetType === 'user' || targetType === 'designer') {
      if (consultation) {
        const Consultation = require('../models/Consultation');
        const consultationDoc = await Consultation.findById(consultation);
        
        if (!consultationDoc || consultationDoc.status !== 'completed') {
          return res.status(400).json({
            success: false,
            message: 'Can only review after consultation is completed'
          });
        }

        // Check if user is part of this consultation
        const isAuthorized = consultationDoc.homeowner.toString() === req.user.id || 
                            (consultationDoc.designer && consultationDoc.designer.user && 
                             consultationDoc.designer.user.toString() === req.user.id);
        
        if (!isAuthorized) {
          return res.status(403).json({
            success: false,
            message: 'You can only review users/designers you have worked with'
          });
        }
      }
      // If no consultation provided, allow general reviews (for now)
    }

    // Check if user already reviewed this target for this consultation
    const existingReview = await Review.findOne({
      author: req.user.id,
      targetType,
      targetId,
      ...(consultation && { consultation })
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    const review = new Review({
      author: req.user.id,
      targetType,
      targetId,
      rating,
      comment,
      consultation
    });

    await review.save();

    // Update target rating
    const newRating = await updateTargetRating(targetType, targetId);

    await review.populate('author', 'name avatarUrl');

    // Emit real-time rating update
    const io = req.app.get('io');
    if (io) {
      io.emit('rating-update', {
        targetType,
        targetId,
        newRating,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update target ratings
const updateTargetRating = async (targetType, targetId) => {
  const reviews = await Review.find({ targetType, targetId, isVisible: true });
  
  if (reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  if (targetType === 'designer') {
    const Designer = require('../models/Designer');
    await Designer.findByIdAndUpdate(targetId, { rating: avgRating });
  } else if (targetType === 'user') {
    const UserProfile = require('../models/UserProfile');
    await UserProfile.findOneAndUpdate(
      { user: targetId }, 
      { rating: avgRating, reviewCount: reviews.length }
    );
  } else if (targetType === 'product') {
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(targetId, { rating: avgRating });
  }
};

const validateCreateReview = [
  body('targetType').isIn(['product', 'designer', 'user']).withMessage('Invalid target type'),
  body('targetId').isMongoId().withMessage('Valid target ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters'),
  body('consultation').optional().isMongoId().withMessage('Valid consultation ID is required')
];

module.exports = {
  getReviews,
  createReview,
  validateCreateReview
};
