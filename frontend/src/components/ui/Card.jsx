import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'soft',
  hover = false,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
  };

  const hoverClasses = hover ? 'hover:shadow-medium transition-shadow duration-200' : '';

  return (
    <div
      className={`
        bg-white rounded-lg border border-neutral-200 
        ${paddingClasses[padding]} 
        ${shadowClasses[shadow]} 
        ${hoverClasses} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
