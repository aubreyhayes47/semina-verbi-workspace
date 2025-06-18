// Slider.tsx
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ label, id, min = 0, max = 100, step = 1, value, onChange, className = '', ...props }) => {
  const uniqueId = id || `slider-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={uniqueId} className="block text-gray-700 text-sm font-medium mb-2">
          {label} {value !== undefined && <span className="font-normal text-gray-500">({value})</span>}
        </label>
      )}
      <input
        type="range"
        id={uniqueId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
};

export default Slider;