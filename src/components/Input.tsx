// Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, error, icon, className = '', ...props }) => {
  const uniqueId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={uniqueId} className="block text-gray-700 text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <input
          id={uniqueId}
          data-testid={label ? label.toLowerCase().replace(/\s+/g, '-') : undefined}
          className={`w-full px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default Input;