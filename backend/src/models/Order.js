const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    consultation: {
      designer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designer'
      },
      slot: {
        date: Date,
        from: String,
        to: String
      },
      priceAt: {
        type: Number
      }
    },
    quantity: {
      type: Number,
      min: 0
    },
    price: {
      type: Number
    }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'credit_card', 'bank_transfer'],
    default: 'cash_on_delivery'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true
});

// Add indexes for frequently queried fields
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ 'items.consultation.designer': 1 });

orderSchema.pre('save', function(next) {
  this.total = this.subtotal + this.shipping;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
