import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LazyWrapper = ({ children, fallback = null }) => {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;
