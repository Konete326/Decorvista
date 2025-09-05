const Designer = require('../models/Designer');
const User = require('../models/User');
const { body, query } = require('express-validator');

const getDesigners = async (req, res, next) => {
  try {
    const { specialty, location, page = 1, limit = 10 } = req.query;
    const queryObj = {};

    if (specialty) {
      queryObj.specialties = { $in: [specialty] };
    }
    if (location) {
      queryObj.location = new RegExp(location, 'i');
    }

    const designers = await Designer.find(queryObj)
      .populate('user', 'name email avatarUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const total = await Designer.countDocuments(queryObj);

    res.json({
      success: true,
      data: designers,
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

// Get designer profile for the authenticated user
const getMyDesignerProfile = async (req, res, next) => {
  try {
    const designer = await Designer.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatarUrl');

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer profile not found'
      });
    }

    res.json({
      success: true,
      data: designer
    });
  } catch (error) {
    next(error);
  }
};

const getDesigner = async (req, res, next) => {
  try {
    const designer = await Designer.findById(req.params.id)
      .populate('user', 'name email phone avatarUrl');

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }

    res.json({
      success: true,
      data: designer
    });
  } catch (error) {
    next(error);
  }
};

const createDesigner = async (req, res, next) => {
  try {
    const existingDesigner = await Designer.findOne({ user: req.user.id });
    if (existingDesigner) {
      return res.status(400).json({
        success: false,
        message: 'Designer profile already exists'
      });
    }

    const designerData = req.body;

    const designer = await Designer.create({
      user: req.user.id,
      ...designerData,
      profileCompleted: true
    });

    await designer.populate('user', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      data: designer
    });
  } catch (error) {
    next(error);
  }
};

const updateDesigner = async (req, res, next) => {
  try {
    let designer = await Designer.findById(req.params.id);

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }

    if (designer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    designer = await Designer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatarUrl');

    res.json({
      success: true,
      data: designer
    });
  } catch (error) {
    next(error);
  }
};

const validateCreateDesigner = [
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('portfolio').optional().isArray().withMessage('Portfolio must be an array')
];

const validateUpdateDesigner = [
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('portfolio').optional().isArray().withMessage('Portfolio must be an array'),
  body('availabilitySlots').optional().isArray().withMessage('Availability slots must be an array')
];

module.exports = {
  getDesigners,
  getDesigner,
  getMyDesignerProfile,
  createDesigner,
  updateDesigner,
  validateCreateDesigner,
  validateUpdateDesigner
};
