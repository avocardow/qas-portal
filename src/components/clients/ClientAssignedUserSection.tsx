import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { User } from '@prisma/client';

interface ClientAssignedUserSectionProps {
  assignedUser: User;
}

export default function ClientAssignedUserSection({ assignedUser }: ClientAssignedUserSectionProps) {
  return (
    <ComponentCard title="Assigned User">
      <p>{assignedUser.name ?? assignedUser.email}</p>
    </ComponentCard>
  );
} 