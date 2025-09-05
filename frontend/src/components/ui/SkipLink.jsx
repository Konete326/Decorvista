import React from 'react';

const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        z-50 transition-all duration-200
      "
    >
      {children}
    </a>
  );
};

export default SkipLink;
