import React, { useState, useRef, useEffect } from 'react';
import { imageOptimization } from '../../utils/imageOptimization';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  quality = 80,
  format = 'webp',
  placeholder = true,
  sizes,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef();

  // Generate optimized URL
  const optimizedSrc = imageOptimization.optimizeUrl(src, {
    width,
    height,
    quality,
    format
  });

  // Generate responsive URLs if sizes are provided
  const responsiveUrls = sizes ? imageOptimization.generateResponsiveUrls(src, sizes) : null;

  // Lazy loading effect
  useEffect(() => {
    if (!lazy) return;

    const observer = imageOptimization.createLazyLoadObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Image loading effect
  useEffect(() => {
    if (isInView && src) {
      imageOptimization.preloadImage(optimizedSrc)
        .then(() => setIsLoaded(true))
        .catch(() => setError(true));
    }
  }, [isInView, optimizedSrc]);

  // Generate placeholder
  const placeholderSrc = placeholder && width && height
    ? imageOptimization.generatePlaceholder(width, height)
    : null;

  if (error) {
    return (
      <div 
        ref={imgRef}
        className={`bg-neutral-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <span className="text-neutral-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {placeholder && !isLoaded && (
        <div
          className="absolute inset-0 bg-neutral-200 animate-pulse"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...(responsiveUrls && {
            srcSet: responsiveUrls.map(({ url, size }) => `${url} ${size}w`).join(', '),
            sizes: responsiveUrls.map(({ media, size }) => `${media} ${size}px`).join(', ')
          })}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
