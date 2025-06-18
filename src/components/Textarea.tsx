// Textarea.tsx
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, error, className = '', ...props }, ref) => {
    const uniqueId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={uniqueId} className="block text-gray-700 text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <textarea
          id={uniqueId}
          ref={ref}
          data-testid={label ? label.toLowerCase().replace(/\s+/g, '-') : undefined}
          className={`w-full px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
      </div>
    );
  }
);

export default Textarea;