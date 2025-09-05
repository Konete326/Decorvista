const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Designer = require('../models/Designer');

const createOrder = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const { items, shippingAddress, paymentMethod, notes, consultationBookings } = req.body;
      
      let cart = null;
      let orderItems = [];
      let subtotal = 0;

      // Handle direct buy (items passed in request) or cart-based order
      if (items && items.length > 0) {
        // Direct buy - use items from request body
        for (const item of items) {
          const product = await Product.findById(item.product).session(session);
          if (!product) {
            throw new Error(`Product not found: ${item.product}`);
          }
          
          if (product.inventory < item.quantity) {
            throw new Error(`Insufficient inventory for ${product.title}. Available: ${product.inventory}, Requested: ${item.quantity}`);
          }

          // Update inventory
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { inventory: -item.quantity } },
            { session }
          );

          orderItems.push({
            product: item.product,
            quantity: item.quantity,
            priceAt: item.priceAt || product.price
          });
          subtotal += (item.priceAt || product.price) * item.quantity;
        }
      } else {
        // Cart-based order
        cart = await Cart.findOne({ user: req.user.id }).populate('items.product').session(session);
        
        // Check if both cart and consultations are empty
        if ((!cart || cart.items.length === 0) && (!consultationBookings || consultationBookings.length === 0)) {
          throw new Error('Cart is empty and no consultations selected');
        }

        // Process cart items with atomic inventory updates
        if (cart && cart.items.length > 0) {
          for (const item of cart.items) {
            // Atomic inventory check and decrement
            const product = await Product.findOneAndUpdate(
              { 
                _id: item.product._id, 
                inventory: { $gte: item.quantity } 
              },
              { 
                $inc: { inventory: -item.quantity } 
              },
              { 
                new: true, 
                session 
              }
            );

            if (!product) {
              throw new Error(`Insufficient inventory for ${item.product.title}. Available: ${item.product.inventory}, Requested: ${item.quantity}`);
            }

            orderItems.push({
              product: item.product._id,
              quantity: item.quantity,
              price: item.product.price
            });
            subtotal += item.product.price * item.quantity;
          }
        }
      }

      // Process consultation bookings
      if (consultationBookings && consultationBookings.length > 0) {
        for (const booking of consultationBookings) {
          // Verify slot availability atomically
          const designer = await Designer.findOneAndUpdate(
            {
              _id: booking.designerId,
              'availabilitySlots': {
                $elemMatch: {
                  date: new Date(booking.slot.date),
                  from: booking.slot.from,
                  to: booking.slot.to,
                  status: 'available'
                }
              }
            },
            {
              $set: {
                'availabilitySlots.$.status': 'booked'
              }
            },
            { 
              new: true, 
              session 
            }
          );

          if (!designer) {
            throw new Error(`Selected time slot is no longer available`);
          }

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

      const total = subtotal + shipping;

      const order = await Order.create([{
        user: req.user.id,
        items: orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        subtotal,
        shipping,
        total,
        notes
      }], { session });

      // Clear cart only if it was a cart-based order (not direct buy)
      if (cart && !items) {
        await Cart.findOneAndUpdate(
          { user: req.user.id },
          { items: [] },
          { session }
        );
      }

      const populatedOrder = await Order.findById(order[0]._id)
        .populate('items.product', 'title images')
        .populate('items.consultation.designer', 'user bio specialties')
        .populate('user', 'name email')
        .session(session);

      // Emit socket events for real-time notifications
      const io = req.app.get('io');
      if (io) {
        // Notify admin of new order
        io.to('admin-room').emit('order-update', {
          type: 'new_order',
          message: `New order #${order[0]._id} received`,
          order: populatedOrder
        });

        // Notify user of order confirmation
        io.to(`user-${req.user.id}`).emit('order-update', {
          type: 'order_confirmed',
          message: 'Your order has been confirmed!',
          order: populatedOrder
        });

        // Notify designers of consultation bookings
        if (consultationBookings && consultationBookings.length > 0) {
          for (const booking of consultationBookings) {
            const designer = await Designer.findById(booking.designerId).populate('user').session(session);
            if (designer) {
              io.to(`user-${designer.user._id}`).emit('booking-update', {
                type: 'consultation_booked',
                message: 'You have a new consultation booking',
                booking: {
                  slot: booking.slot,
                  order: order[0]._id
                }
              });
            }
          }
        }
      }

      return populatedOrder;
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message.includes('Insufficient inventory') || 
        error.message.includes('Cart is empty') ||
        error.message.includes('no longer available')) {
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
      .populate('items.product', 'name title images price category')
      .populate('user', 'name email phone')
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
      .populate('items.product', 'name title images price category')
      .populate('items.product.category', 'name')
      .populate('user', 'name email phone');

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

const updateOrderStatus = async (req, res, next) => {
  const session = await require('mongoose').startSession();
  
  try {
    await session.withTransaction(async () => {
      const { status } = req.body;
      const orderId = req.params.id;
      
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('Order not found');
      }

      const oldStatus = order.status;
      
      // Handle inventory restoration for cancelled orders
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { inventory: item.quantity } },
              { session }
            );
          }
          
          // Free up consultation slots
          if (item.consultation && item.consultation.designer) {
            await Designer.findByIdAndUpdate(
              item.consultation.designer,
              {
                $set: {
                  'availabilitySlots.$[elem].status': 'available'
                }
              },
              {
                arrayFilters: [{
                  'elem.date': item.consultation.slot.date,
                  'elem.from': item.consultation.slot.from,
                  'elem.to': item.consultation.slot.to
                }],
                session
              }
            );
          }
        }
      }

      order.status = status;
      await order.save({ session });

      await order.populate('items.product');
      await order.populate('user', 'name email');

      // Emit socket events for status updates
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${order.user._id || order.user}`).emit('order-update', {
          type: 'status_updated',
          message: `Your order status has been updated to ${status}`,
          order: order
        });

        if (req.user.role === 'admin') {
          io.to('admin-room').emit('order-update', {
            type: 'admin_status_update',
            message: `Order #${orderId} status updated to ${status}`,
            order: order
          });
        }
      }

      res.json({
        success: true,
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
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
