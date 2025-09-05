// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image URLs with different sizes
  generateResponsiveUrls: (baseUrl, sizes = [300, 600, 900, 1200]) => {
    return sizes.map(size => ({
      size,
      url: `${baseUrl}?w=${size}&q=80&f=webp`,
      media: `(max-width: ${size}px)`
    }));
  },

  // Create optimized image URL with parameters
  optimizeUrl: (url, options = {}) => {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover'
    } = options;

    const params = new URLSearchParams();
    
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('f', format);
    params.append('fit', fit);

    return `${url}?${params.toString()}`;
  },

  // Lazy loading intersection observer
  createLazyLoadObserver: (callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  },

  // Preload critical images
  preloadImage: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  // Convert image to WebP if supported
  supportsWebP: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  },

  // Generate placeholder for lazy loading
  generatePlaceholder: (width, height, color = '#f3f4f6') => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL();
  }
};

// React hook for lazy loading images
export const useLazyImage = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = imageOptimization.createLazyLoadObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      options
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src) {
      imageOptimization.preloadImage(src)
        .then(() => setIsLoaded(true))
        .catch(console.error);
    }
  }, [isInView, src]);

  return { imgRef, isLoaded, isInView };
};
