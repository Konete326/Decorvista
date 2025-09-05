const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { body } = require('express-validator');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title price images inventory');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory'
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.priceAt = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAt: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'title price images inventory');

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'title price images inventory');

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory'
      });
    }

    cartItem.quantity = quantity;
    cartItem.priceAt = product.price;

    await cart.save();
    await cart.populate('items.product', 'title price images inventory');

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    for (const item of cart.items) {
      if (item.product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${item.product.title}`
        });
      }
    }

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { inventory: -item.quantity }
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Checkout successful'
    });
  } catch (error) {
    next(error);
  }
};

const validateAddToCart = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const validateUpdateCart = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  checkout,
  validateAddToCart,
  validateUpdateCart
};
