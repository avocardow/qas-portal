import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
// Minimal contact shape for client details
export type ClientContactItem = {
  id?: string;
  name?: string | null;
  isPrimary: boolean;
};

interface ClientContactsSectionProps {
  contacts: ClientContactItem[];
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