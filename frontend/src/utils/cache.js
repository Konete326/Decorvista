// Simple in-memory cache with TTL (Time To Live)
class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = 300000) { // Default 5 minutes TTL
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Remove from cache
    this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Clear cache
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Get cache statistics
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create a singleton instance
const cache = new Cache();

// Cache utilities for API responses
export const apiCache = {
  // Generate cache key for API requests
  generateKey: (url, params = {}) => {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return paramString ? `${url}?${paramString}` : url;
  },

  // Cache API response
  set: (key, data, ttl) => cache.set(key, data, ttl),

  // Get cached API response
  get: (key) => cache.get(key),

  // Check if API response is cached
  has: (key) => cache.has(key),

  // Delete cached API response
  delete: (key) => cache.delete(key),

  // Clear all cached API responses
  clear: () => cache.clear(),

  // Cache with automatic key generation
  cacheResponse: (url, params, data, ttl) => {
    const key = apiCache.generateKey(url, params);
    cache.set(key, data, ttl);
    return key;
  },

  // Get cached response with automatic key generation
  getCachedResponse: (url, params) => {
    const key = apiCache.generateKey(url, params);
    return cache.get(key);
  }
};

// Local storage cache for persistent data
export const persistentCache = {
  set: (key, value, ttl = null) => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check if item has expired
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  delete: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

export default cache;
