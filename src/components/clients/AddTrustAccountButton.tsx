import React from 'react';
import Button from '@/components/ui/button/Button';
import { PlusIcon } from '@/icons';

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
      startIcon={<PlusIcon className="h-4 w-4" />}
    >
      Add Trust Account
    </Button>
  );
} 