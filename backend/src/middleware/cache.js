const NodeCache = require('node-cache');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone objects for better performance
});

// Cache middleware for GET requests
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query parameters
    const key = req.originalUrl || req.url;
    
    // Try to get cached response
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`Cache hit for: ${key}`);
      return res.json(cachedResponse);
    }

    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        console.log(`Caching response for: ${key}`);
        cache.set(key, data, duration);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache by pattern
const clearCacheByPattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => {
    cache.del(key);
  });
  
  console.log(`Cleared ${matchingKeys.length} cache entries matching pattern: ${pattern}`);
};

// Clear all cache
const clearAllCache = () => {
  cache.flushAll();
  console.log('All cache cleared');
};

// Get cache statistics
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCacheByPattern,
  clearAllCache,
  getCacheStats
};
