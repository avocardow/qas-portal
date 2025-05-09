"use client";
import React from 'react';
import Button from '@/components/ui/button/Button';
import { PencilIcon } from '@/icons';

interface EditTrustAccountButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function EditTrustAccountButton({ onClick, className = '' }: EditTrustAccountButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="link"
      className={className}
      startIcon={<PencilIcon className="h-4 w-4" />}
    >
      Edit
    </Button>
  );
} 