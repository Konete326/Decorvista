const GalleryItem = require('../models/GalleryItem');
const { body } = require('express-validator');

const getGalleryItems = async (req, res, next) => {
  try {
    const { tags, designer, page = 1, limit = 12 } = req.query;
    const queryObj = {};

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      queryObj.tags = { $in: tagArray };
    }

    if (designer) {
      queryObj.designer = designer;
    }

    const galleryItems = await GalleryItem.find(queryObj)
      .populate({
        path: 'designer',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const total = await GalleryItem.countDocuments(queryObj);

    res.json({
      success: true,
      data: galleryItems,
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

const createGalleryItem = async (req, res, next) => {
  try {
    const galleryData = { ...req.body };

    if (req.user.role === 'designer') {
      const Designer = require('../models/Designer');
      const designer = await Designer.findOne({ user: req.user.id });
      if (designer) {
        galleryData.designer = designer._id;
      }
    }

    const galleryItem = await GalleryItem.create(galleryData);

    await galleryItem.populate({
      path: 'designer',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

    res.status(201).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    next(error);
  }
};

const validateCreateGalleryItem = [
  body('title').trim().notEmpty().isLength({ max: 100 }).withMessage('Title is required and must not exceed 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

module.exports = {
  getGalleryItems,
  createGalleryItem,
  validateCreateGalleryItem
};
