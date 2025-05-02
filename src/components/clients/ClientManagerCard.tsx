import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { User } from '@prisma/client';

interface ClientManagerCardProps {
  manager: User;
}

export default function ClientManagerCard({ manager }: ClientManagerCardProps) {
  return (
    <ComponentCard title="Client Manager">
      <p>{manager.name ?? manager.email}</p>
    </ComponentCard>
  );
} 