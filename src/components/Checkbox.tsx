// Checkbox.tsx
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
  const uniqueId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={uniqueId}
        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        {...props}
      />
      {label && (
        <label htmlFor={uniqueId} className="ml-2 text-gray-700 text-sm cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;