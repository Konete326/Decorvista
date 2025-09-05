const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    priceAt: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  }]
}, {
  timestamps: true
});

// Virtual for total calculation
cartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => total + (item.priceAt * item.quantity), 0);
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
