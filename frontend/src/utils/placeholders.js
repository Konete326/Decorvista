// Placeholder utility functions for images
export const createPlaceholderDataURL = (width, height, text = 'No Image', bgColor = '#f3f4f6', textColor = '#6b7280') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

// Common placeholder configurations
export const PLACEHOLDER_CONFIGS = {
  avatar: { width: 120, height: 120, text: 'Avatar' },
  product: { width: 400, height: 400, text: 'Product' },
  portfolio: { width: 400, height: 300, text: 'Portfolio' },
  gallery: { width: 600, height: 400, text: 'Gallery' },
  thumbnail: { width: 100, height: 100, text: 'Thumb' }
};

// Generate specific placeholder types
export const getPlaceholder = (type = 'product') => {
  const config = PLACEHOLDER_CONFIGS[type] || PLACEHOLDER_CONFIGS.product;
  return createPlaceholderDataURL(config.width, config.height, config.text);
};

// React component for placeholder images
export const PlaceholderImage = ({ 
  width = 400, 
  height = 300, 
  text = 'No Image', 
  className = '',
  alt = 'Placeholder'
}) => {
  return (
    <div 
      className={`bg-gray-200 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
};
