const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const Designer = require('../models/Designer');
const { body } = require('express-validator');
const { validateFavorite } = require('../middleware/validation');

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('product', 'title price images')
      .populate('designer', 'user bio specialties');

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { type, productId, designerId } = req.body;
    
    // Validate input
    if (type === 'product' && !productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required for product favorites'
      });
    }
    
    if (type === 'designer' && !designerId) {
      return res.status(400).json({
        success: false,
        message: 'Designer ID is required for designer favorites'
      });
    }
    
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      ...(type === 'product' ? { product: productId } : { designer: designerId })
    });
    
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Item already favorited'
      });
    }
    
    // Create favorite
    const favoriteData = {
      user: req.user.id,
      type
    };
    
    if (type === 'product') {
      favoriteData.product = productId;
    } else if (type === 'designer') {
      favoriteData.designer = designerId;
    }
    
    const favorite = await Favorite.create(favoriteData);
    
    // Populate based on type
    if (type === 'product') {
      await favorite.populate('product', 'title price images');
    } else if (type === 'designer') {
      await favorite.populate('designer', 'user bio specialties');
    }
    
    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const favorite = await Favorite.findById(id);
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }
    
    // Check authorization
    if (favorite.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this favorite'
      });
    }
    
    await Favorite.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  validateAddFavorite: validateFavorite
};
