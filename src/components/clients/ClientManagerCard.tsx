import React from 'react';
import Card from '@/components/common/Card';
import type { User } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

interface ClientManagerCardProps {
  manager: User;
}

export default function ClientManagerCard({ manager }: ClientManagerCardProps) {
  return (
    <Card title="Client Manager" className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
        {manager.image ? (
          <Image
            src={manager.image}
            alt={manager.name ?? 'Profile'}
            width={48}
            height={48}
          />
        ) : (
          <span className="text-xl text-gray-400">
            {(manager.name ?? manager.email ?? '').charAt(0)}
          </span>
        )}
      </div>
      <div>
        <Link
          href={`/settings/users/${manager.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {manager.name ?? manager.email}
        </Link>
        {manager.email && (
          <p className="mt-1 text-sm text-gray-500">{manager.email}</p>
        )}
      </div>
    </Card>
  );
} 