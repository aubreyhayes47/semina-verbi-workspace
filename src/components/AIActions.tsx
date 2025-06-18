// src/components/AIActions.tsx
// Reusable AI action button/component for summarization, semantic search, and doctrinal check
import React from 'react';
import Button from './Button';
import Spinner from './Spinner';

interface AIActionsProps {
  label: string;
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const AIActions: React.FC<AIActionsProps> = ({ label, onClick, isLoading, disabled, icon, className }) => (
  <Button
    onClick={onClick}
    disabled={isLoading || disabled}
    className={className || 'flex items-center'}
    aria-label={label}
  >
    {isLoading ? <Spinner size="sm" color="text-white" className="mr-2" /> : icon}
    {label}
  </Button>
);

export default AIActions;
