const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery item title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  }
}, {
  timestamps: true
});

galleryItemSchema.index({ tags: 1 });
galleryItemSchema.index({ designer: 1 });
galleryItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
