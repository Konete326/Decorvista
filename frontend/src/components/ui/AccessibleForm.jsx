import React, { useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const FormField = ({ 
  label, 
  error, 
  helperText, 
  required = false, 
  children, 
  id,
  className = '' 
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-neutral-700"
      >
        {label}
        {required && (
          <span className="text-error-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      <div className="relative">
        {React.cloneElement(children, {
          id: fieldId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': error ? errorId : helperText ? helperId : undefined,
          'aria-required': required,
          className: `${children.props.className || ''} ${
            error 
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500' 
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
          }`.trim()
        })}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-error-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

const AccessibleForm = ({ 
  onSubmit, 
  children, 
  className = '',
  ariaLabel,
  ariaLabelledBy 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      noValidate
    >
      {children}
    </form>
  );
};

const FieldSet = ({ legend, children, className = '' }) => (
  <fieldset className={`space-y-4 ${className}`}>
    <legend className="text-base font-medium text-neutral-900 sr-only">
      {legend}
    </legend>
    {children}
  </fieldset>
);

export { AccessibleForm, FormField, FieldSet };
