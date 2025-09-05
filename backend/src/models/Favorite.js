const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  type: {
    type: String,
    enum: ['product', 'designer'],
    required: true
  }
}, {
  timestamps: true
});

favoriteSchema.index({ user: 1, type: 1 });
favoriteSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ user: 1, designer: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
