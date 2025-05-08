"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableTwo from '@/components/tables/DataTables/TableTwo/DataTableTwo';
import Badge from '@/components/ui/badge/Badge';
import AddContactButton from '@/components/clients/AddContactButton';
import AddContactModal from '@/components/clients/AddContactModal';
import Authorized from '@/components/Authorized';
import { AUDIT_PERMISSIONS } from '@/constants/permissions';
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
  const params = useParams<{ clientId: string }>() || {};
  const clientId = params.clientId;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const router = useRouter();
  // Filter contacts based on search term for search functionality
  const filteredContacts = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return contacts.filter(contact =>
      (contact.name?.toLowerCase().includes(term) ||
       contact.email?.toLowerCase().includes(term) ||
       contact.phone?.toLowerCase().includes(term) ||
       contact.title?.toLowerCase().includes(term))
    );
  }, [contacts, searchTerm]);
  // Reset to first page when filter criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredContacts]);
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
      cell: (row: ContactRow) => (row.isPrimary ? <Badge variant="light" color="success" size="sm">Primary</Badge> : null),
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
    <>
      <ComponentCard
        title="Contacts"
        actions={
          <Authorized action={AUDIT_PERMISSIONS.GET_BY_CLIENT_ID}>
            <AddContactButton onClick={() => setIsModalOpen(true)} />
          </Authorized>
        }
      >
        <DataTableTwo
          data={filteredContacts}
          columns={columns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          caption="Recent Contacts Table"
          onRowClick={(row) => router.push(`/contacts/${row.id}`)}
        />
      </ComponentCard>
      <AddContactModal
        clientId={clientId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 