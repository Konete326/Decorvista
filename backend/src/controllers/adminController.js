const User = require('../models/User');
const Product = require('../models/Product');
const Consultation = require('../models/Consultation');
const Review = require('../models/Review');
const Designer = require('../models/Designer');
const GalleryItem = require('../models/GalleryItem');
const Order = require('../models/Order');

const getReports = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDesigners,
      totalProducts,
      totalConsultations,
      totalReviews,
      totalGalleryItems,
      totalOrders,
      pendingConsultations,
      completedConsultations,
      usersByRole,
      revenueData
    ] = await Promise.all([
      User.countDocuments(),
      Designer.countDocuments(),
      Product.countDocuments(),
      Consultation.countDocuments(),
      Review.countDocuments(),
      GalleryItem.countDocuments(),
      Order.countDocuments(),
      Consultation.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'completed' }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ])
    ]);

    const roleStats = usersByRole.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: roleStats
        },
        designers: totalDesigners,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue,
        consultations: {
          total: totalConsultations,
          pending: pendingConsultations,
          completed: completedConsultations
        },
        reviews: totalReviews,
        galleryItems: totalGalleryItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get pending designer applications
const getPendingDesigners = async (req, res, next) => {
  try {
    const pendingDesigners = await Designer.find({ 
      profileCompleted: true,
      status: 'pending'
    })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .sort('-createdAt');

    res.json({
      success: true,
      data: pendingDesigners
    });
  } catch (error) {
    next(error);
  }
};

// Approve designer application
const approveDesigner = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  
  try {
    await session.withTransaction(async () => {
      const { designerId } = req.params;
      
      const designer = await Designer.findById(designerId).session(session);
      if (!designer) {
        throw new Error('Designer not found');
      }

      designer.status = 'approved';
      await designer.save({ session });

      // Update user role to designer if not already
      await User.findByIdAndUpdate(
        designer.user,
        { role: 'designer' },
        { session }
      );

      // Emit socket notification
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${designer.user}`).emit('designer-update', {
          type: 'application_approved',
          message: 'Your designer application has been approved!',
          designer
        });
      }

      res.json({
        success: true,
        message: 'Designer approved successfully',
        data: designer
      });
    });
  } catch (error) {
    if (error.message === 'Designer not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

// Reject designer application
const rejectDesigner = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  
  try {
    await session.withTransaction(async () => {
      const { designerId } = req.params;
      const { reason } = req.body;
      
      const designer = await Designer.findById(designerId).session(session);
      if (!designer) {
        throw new Error('Designer not found');
      }

      designer.status = 'rejected';
      designer.rejectionReason = reason;
      await designer.save({ session });

      // Emit socket notification
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${designer.user}`).emit('designer-update', {
          type: 'application_rejected',
          message: 'Your designer application was not approved.',
          reason,
          designer
        });
      }

      res.json({
        success: true,
        message: 'Designer application rejected',
        data: designer
      });
    });
  } catch (error) {
    if (error.message === 'Designer not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

// Get all users with pagination and filtering
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders with pagination and filtering
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      // Search by order ID or user name
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { user: { $in: users.map(u => u._id) } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'title price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
const updateOrderStatus = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  
  try {
    await session.withTransaction(async () => {
      const { orderId } = req.params;
      const { status } = req.body;
      
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;
      await order.save({ session });

      // Emit socket notification to user
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${order.user}`).emit('order-update', {
          type: 'status_updated',
          message: `Your order status has been updated to ${status}`,
          order
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getReports,
  getPendingDesigners,
  approveDesigner,
  rejectDesigner,
  getUsers,
  getOrders,
  updateOrderStatus
};
