import React from 'react';
import Button from '@/components/ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface AddTrustAccountButtonProps {
  onClick: () => void;
  className?: string;
}

export default function AddTrustAccountButton({ onClick, className = '' }: AddTrustAccountButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="link"
      className={className}
      startIcon={<FontAwesomeIcon icon={faPlus} aria-hidden="true" className="h-4 w-4" />}
    >
      Add Trust Account
    </Button>
  );
} 