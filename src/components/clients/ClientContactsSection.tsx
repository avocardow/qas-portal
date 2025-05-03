import React, { useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableTwo from '@/components/tables/DataTables/TableTwo/DataTableTwo';
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
  const [searchTerm, setSearchTerm] = useState('');
  if (!contacts || contacts.length === 0) {
    return (
      <ComponentCard title="Contacts">
        <p>No contacts available.</p>
      </ComponentCard>
    );
  }
  return (
    <ComponentCard title="Contacts">
      <DataTableTwo
        data={contacts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </ComponentCard>
  );
} 