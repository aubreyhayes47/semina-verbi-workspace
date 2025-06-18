// Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, className = '', ...props }) => {
  const uniqueId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={uniqueId} className="block text-gray-700 text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <select
        id={uniqueId}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default Select;