import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { User } from '@prisma/client';
import Link from 'next/link';

interface ClientManagerCardProps {
  manager: User;
}

export default function ClientManagerCard({ manager }: ClientManagerCardProps) {
  return (
    <ComponentCard title="Client Manager">
      <Link href={`/settings/users/${manager.id}`} className="text-blue-600 hover:underline">
        {manager.name ?? manager.email}
      </Link>
      {manager.email && <p className="mt-1 text-sm text-gray-500">{manager.email}</p>}
    </ComponentCard>
  );
} 