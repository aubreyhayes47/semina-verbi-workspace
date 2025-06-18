// Switch.tsx
import React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';

interface SwitchProps {
  label?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ label, enabled, onChange, className = '' }) => {
  return (
    <HeadlessSwitch.Group as="div" className={`flex items-center ${className}`}>
      {label && (
        <HeadlessSwitch.Label as="span" className="mr-3 text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </HeadlessSwitch.Label>
      )}
      <HeadlessSwitch
        checked={enabled}
        onChange={onChange}
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  );
};

export default Switch;