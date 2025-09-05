const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Designer = require('../models/Designer');

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes, consultationBookings } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    // Check if both cart and consultations are empty
    if ((!cart || cart.items.length === 0) && (!consultationBookings || consultationBookings.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty and no consultations selected'
      });
    }

    // Validate product inventory
    if (cart && cart.items.length > 0) {
      for (const item of cart.items) {
        if (item.product.inventory < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${item.product.title}`
          });
        }
      }
    }

    const orderItems = [];
    
    // Add products to order items
    let subtotal = 0;
    if (cart && cart.items.length > 0) {
      for (const item of cart.items) {
        orderItems.push({
          product: item.product._id,
          quantity: item.quantity,
          priceAt: item.product.price
        });
        subtotal += item.product.price * item.quantity;
      }
    }

    // Add consultations to order items
    if (consultationBookings && consultationBookings.length > 0) {
      for (const booking of consultationBookings) {
        orderItems.push({
          consultation: {
            designer: booking.designerId,
            slot: booking.slot,
            priceAt: booking.price
          },
          quantity: 1,
          priceAt: booking.price
        });
        subtotal += booking.price;
      }
    }

    const shipping = subtotal > 100 ? 0 : 10;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      subtotal,
      shipping,
      notes
    });

    // Update product inventory
    if (cart && cart.items.length > 0) {
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { inventory: -item.quantity } }
        );
      }
    }

    // Update designer availability slots
    if (consultationBookings && consultationBookings.length > 0) {
      for (const booking of consultationBookings) {
        await Designer.findByIdAndUpdate(
          booking.designerId,
          { 
            $set: { 
              "availabilitySlots.$[elem].status": "booked" 
            } 
          },
          { 
            arrayFilters: [
              { 
                "elem.date": new Date(booking.slot.date),
                "elem.from": booking.slot.from,
                "elem.to": booking.slot.to
              }
            ]
          }
        );
      }
    }

    // Clear cart
    if (cart) {
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [] }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'title images')
      .populate('items.consultation.designer', 'user bio specialties')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'title images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const order = await Order.findOne(query)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product').populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
