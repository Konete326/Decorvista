const User = require('../models/User');
const Product = require('../models/Product');
const Consultation = require('../models/Consultation');
const Review = require('../models/Review');
const Designer = require('../models/Designer');
const GalleryItem = require('../models/GalleryItem');

const getReports = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDesigners,
      totalProducts,
      totalConsultations,
      totalReviews,
      totalGalleryItems,
      pendingConsultations,
      completedConsultations,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      Designer.countDocuments(),
      Product.countDocuments(),
      Consultation.countDocuments(),
      Review.countDocuments(),
      GalleryItem.countDocuments(),
      Consultation.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'completed' }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    const roleStats = usersByRole.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: roleStats
        },
        designers: totalDesigners,
        products: totalProducts,
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

module.exports = {
  getReports
};
