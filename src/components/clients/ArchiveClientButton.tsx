import React from 'react';
import { useAbility } from '@/hooks/useAbility';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import Button from '@/components/ui/button/Button';
import { BoxIconLine as ArchiveIcon } from '@/icons';

interface ArchiveClientButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ArchiveClientButton({ onClick, className = '' }: ArchiveClientButtonProps) {
  const { can } = useAbility();
  if (!can(CLIENT_PERMISSIONS.ARCHIVE)) {
    return null;
  }
  return (
    <Button
      onClick={onClick}
      variant="link"
      className={`text-red-600 hover:underline ${className}`}
      startIcon={<ArchiveIcon className="h-4 w-4" />}
      aria-label="Archive Client"
    >
      Archive Client
    </Button>
  );
} 