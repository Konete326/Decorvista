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
          select: 'name email phone avatarUrl'
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
  const session = await require('mongoose').startSession();
  
  try {
    await session.withTransaction(async () => {
      const { designer, slot, notes } = req.body;

      console.log('Creating consultation with data:', { designer, slot, notes });

      const designerDoc = await Designer.findById(designer).session(session);
      if (!designerDoc) {
        throw new Error('Designer not found');
      }

      console.log('Designer found:', designerDoc.user);
      console.log('Designer availability slots:', designerDoc.availabilitySlots);

      // Create consultation without checking availability slots for now
      const consultation = await Consultation.create([{
        homeowner: req.user.id,
        designer,
        slot,
        notes
      }], { session });

      console.log('Consultation created successfully:', consultation[0]._id);

      await consultation[0].populate('homeowner', 'name email phone');
      await consultation[0].populate({
        path: 'designer',
        populate: {
          path: 'user',
          select: 'name email phone avatarUrl'
        }
      });

      // Emit socket event for real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${designerDoc.user}`).emit('booking-update', {
          type: 'new_booking',
          message: 'You have a new consultation booking request',
          booking: consultation[0]
        });
      }

      res.status(201).json({
        success: true,
        data: consultation[0]
      });
    });
  } catch (error) {
    if (error.message === 'Designer not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Selected slot is not available' || error.message === 'This slot already has a pending consultation') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

const updateConsultation = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  
  try {
    await session.withTransaction(async () => {
      const { status } = req.body;
      const consultation = await Consultation.findById(req.params.id).session(session);

      if (!consultation) {
        throw new Error('Consultation not found');
      }

      let canUpdate = false;
      let designer = null;

      if (req.user.role === 'homeowner' && consultation.homeowner.toString() === req.user.id) {
        if (status === 'cancelled' && consultation.status === 'pending') {
          canUpdate = true;
        }
      } else if (req.user.role === 'designer') {
        designer = await Designer.findOne({ user: req.user.id }).session(session);
        if (designer && consultation.designer.toString() === designer._id.toString()) {
          if (['confirmed', 'cancelled', 'completed'].includes(status)) {
            canUpdate = true;
          }
        }
      } else if (req.user.role === 'admin') {
        canUpdate = true;
        designer = await Designer.findById(consultation.designer).session(session);
      }

      if (!canUpdate) {
        throw new Error('Not authorized to update this consultation');
      }

      const oldStatus = consultation.status;
      consultation.status = status;

      // Handle atomic booking acceptance/rejection
      if (status === 'confirmed' && oldStatus === 'pending') {
        // When accepting a booking, reject all other pending bookings for the same slot
        await Consultation.updateMany({
          designer: consultation.designer,
          'slot.date': consultation.slot.date,
          'slot.from': consultation.slot.from,
          'slot.to': consultation.slot.to,
          status: 'pending',
          _id: { $ne: consultation._id }
        }, {
          status: 'cancelled'
        }, { session });

        // Notify rejected users
        const rejectedConsultations = await Consultation.find({
          designer: consultation.designer,
          'slot.date': consultation.slot.date,
          'slot.from': consultation.slot.from,
          'slot.to': consultation.slot.to,
          status: 'cancelled',
          _id: { $ne: consultation._id }
        }).populate('homeowner').session(session);

        const io = req.app.get('io');
        if (io) {
          rejectedConsultations.forEach(rejectedConsultation => {
            io.to(`user-${rejectedConsultation.homeowner._id}`).emit('booking-update', {
              type: 'booking_rejected',
              message: 'Your consultation request was not accepted as the slot was booked by another user',
              booking: rejectedConsultation
            });
          });

          // Notify the accepted user
          io.to(`user-${consultation.homeowner}`).emit('booking-update', {
            type: 'booking_accepted',
            message: 'Your consultation request has been accepted!',
            booking: consultation
          });
        }
      } else if (status === 'cancelled') {
        // Free up the slot when cancelled
        if (designer) {
          const slot = designer.availabilitySlots.find(
            s => s.date.toISOString() === consultation.slot.date.toISOString() &&
            s.from === consultation.slot.from &&
            s.to === consultation.slot.to
          );
          if (slot) {
            slot.status = 'available';
            await designer.save({ session });
          }
        }

        const io = req.app.get('io');
        if (io) {
          const targetUserId = req.user.role === 'designer' ? consultation.homeowner : 
                              (designer ? designer.user : null);
          if (targetUserId) {
            io.to(`user-${targetUserId}`).emit('booking-update', {
              type: 'booking_cancelled',
              message: 'A consultation has been cancelled',
              booking: consultation
            });
          }
        }
      }

      await consultation.save({ session });

      await consultation.populate('homeowner', 'name email phone');
      await consultation.populate({
        path: 'designer',
        populate: {
          path: 'user',
          select: 'name email phone avatarUrl'
        }
      });

      res.json({
        success: true,
        data: consultation
      });
    });
  } catch (error) {
    if (error.message === 'Consultation not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Not authorized to update this consultation') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  } finally {
    await session.endSession();
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
