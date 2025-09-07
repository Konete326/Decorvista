const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const GalleryItem = require('../models/GalleryItem');

// Get platform statistics
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDesigners,
      totalHomeowners,
      totalProducts,
      totalReviews,
      totalOrders,
      totalGalleryItems,
      totalGalleryImages
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'designer' }),
      User.countDocuments({ role: 'homeowner' }),
      Product.countDocuments(),
      Review.countDocuments(),
      Order.countDocuments(),
      GalleryItem.countDocuments(),
      GalleryItem.aggregate([
        { $unwind: '$images' },
        { $count: 'totalImages' }
      ]).then(result => result[0]?.totalImages || 0)
    ]);

    const stats = {
      users: {
        total: totalUsers,
        designers: totalDesigners,
        homeowners: totalHomeowners,
        admins: totalUsers - totalDesigners - totalHomeowners
      },
      products: totalProducts,
      reviews: totalReviews,
      orders: totalOrders,
      gallery: {
        items: totalGalleryItems,
        images: totalGalleryImages
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
