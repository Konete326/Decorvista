const Consultation = require('../models/Consultation');
const Designer = require('../models/Designer');
const { body } = require('express-validator');

const getConsultations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    let queryObj = {};

    if (req.user.role === 'homeowner') {
      queryObj.homeowner = req.user.id;
    } else if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ user: req.user.id });
      if (designer) {
        queryObj.designer = designer._id;
      }
    }

    const consultations = await Consultation.find(queryObj)
      .populate('homeowner', 'name email phone')
      .populate({
        path: 'designer',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const total = await Consultation.countDocuments(queryObj);

    res.json({
      success: true,
      data: consultations,
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

const createConsultation = async (req, res, next) => {
  try {
    const { designer, slot, notes } = req.body;

    const designerDoc = await Designer.findById(designer);
    if (!designerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found'
      });
    }

    const availableSlot = designerDoc.availabilitySlots.find(
      s => s.date.toISOString() === new Date(slot.date).toISOString() &&
      s.from === slot.from &&
      s.to === slot.to &&
      s.status === 'available'
    );

    if (!availableSlot) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot is not available'
      });
    }

    const consultation = await Consultation.create({
      homeowner: req.user.id,
      designer,
      slot,
      notes
    });

    availableSlot.status = 'booked';
    await designerDoc.save();

    await consultation.populate('homeowner', 'name email phone');
    await consultation.populate({
      path: 'designer',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });

    res.status(201).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

const updateConsultation = async (req, res, next) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    let canUpdate = false;

    if (req.user.role === 'homeowner' && consultation.homeowner.toString() === req.user.id) {
      if (status === 'cancelled' && consultation.status === 'pending') {
        canUpdate = true;
      }
    } else if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ user: req.user.id });
      if (designer && consultation.designer.toString() === designer._id.toString()) {
        if (['confirmed', 'cancelled', 'completed'].includes(status)) {
          canUpdate = true;
        }
      }
    } else if (req.user.role === 'admin') {
      canUpdate = true;
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this consultation'
      });
    }

    consultation.status = status;
    await consultation.save();

    await consultation.populate('homeowner', 'name email phone');
    await consultation.populate({
      path: 'designer',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

const validateCreateConsultation = [
  body('designer').isMongoId().withMessage('Valid designer ID is required'),
  body('slot.date').isISO8601().withMessage('Valid date is required'),
  body('slot.from').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('From time must be in HH:MM format'),
  body('slot.to').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('To time must be in HH:MM format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
];

const validateUpdateConsultation = [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status')
];

module.exports = {
  getConsultations,
  createConsultation,
  updateConsultation,
  validateCreateConsultation,
  validateUpdateConsultation
};
