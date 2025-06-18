// Tooltip.tsx
import React, { useState } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: Placement;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Simple positioning based on placement
  const getPositionClasses = () => {
    switch (placement) {
      case 'top': return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default: return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md shadow-lg
            ${getPositionClasses()} animate-fade-in`}
          style={{ whiteSpace: 'nowrap' }} // Prevent text wrapping in simple tooltip
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;