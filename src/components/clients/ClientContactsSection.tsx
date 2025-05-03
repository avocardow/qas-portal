import React, { useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableTwo from '@/components/tables/DataTables/TableTwo/DataTableTwo';
// import type { Contact } from '@prisma/client';

// Define row type for DataTableTwo to avoid using `any`
type ContactRow = {
  id?: string;
  name?: string | null;
  isPrimary: boolean;
  phone?: string | null;
  email?: string | null;
  title?: string | null;
};

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
  // Define columns for contacts table
  const columns = React.useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      cell: (row: ContactRow) => <a href={`/contacts/${row.id}`} className="text-blue-600 hover:underline">{row.name ?? '-'}</a>,
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'title', header: 'Title' },
    {
      key: 'isPrimary',
      header: 'Primary',
      cell: (row: ContactRow) => (row.isPrimary ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Primary</span> : ''),
    },
  ], []);

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
        columns={columns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </ComponentCard>
  );
} 