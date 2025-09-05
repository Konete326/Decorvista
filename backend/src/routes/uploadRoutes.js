const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/auth');
const path = require('path');

router.post('/single', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.filename
    }
  });
});

router.post('/multiple', protect, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const fileUrls = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename
  }));

  res.json({
    success: true,
    data: fileUrls
  });
});

module.exports = router;
