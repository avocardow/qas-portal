import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
// import type { Contact } from '@prisma/client';

interface ClientContactsSectionProps {
  contacts: Array<{
    id?: string;
    name?: string | null;
    isPrimary: boolean;
    phone?: string | null;
    email?: string | null;
    title?: string | null;
    canLoginToPortal?: boolean;
    portalUserId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    clientId?: string;
  }>;
}

export default function ClientContactsSection({ contacts }: ClientContactsSectionProps) {
  if (!contacts || contacts.length === 0) {
    return (
      <ComponentCard title="Contacts">
        <p>No contacts available.</p>
      </ComponentCard>
    );
  }
  return (
    <ComponentCard title="Contacts">
      <ul>
        {contacts.map((contact, idx) => (
          <li key={contact.id ?? idx}>
            {contact.name ?? '-'} {contact.isPrimary ? '(Primary)' : ''}
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
} 