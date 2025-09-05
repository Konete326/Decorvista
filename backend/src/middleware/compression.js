const compression = require('compression');

// Custom compression middleware with optimized settings
const compressionMiddleware = compression({
  // Only compress responses that are larger than 1kb
  threshold: 1024,
  
  // Compression level (1-9, 6 is default, 1 is fastest, 9 is best compression)
  level: 6,
  
  // Memory level (1-9, 8 is default)
  memLevel: 8,
  
  // Filter function to determine what to compress
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }

    // Don't compress images, videos, and already compressed files
    const contentType = res.getHeader('content-type');
    if (contentType) {
      const type = contentType.toLowerCase();
      if (type.includes('image/') || 
          type.includes('video/') || 
          type.includes('audio/') ||
          type.includes('application/zip') ||
          type.includes('application/gzip') ||
          type.includes('application/x-rar')) {
        return false;
      }
    }

    // Use compression filter
    return compression.filter(req, res);
  }
});

module.exports = compressionMiddleware;
