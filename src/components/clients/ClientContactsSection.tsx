import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { Contact } from '@prisma/client';

interface ClientContactsSectionProps {
  contacts: Contact[];
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
        {contacts.map(contact => (
          <li key={contact.id}>
            {contact.name ?? '-'} {contact.isPrimary ? '(Primary)' : ''}
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
} 