"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import ContactsTable from './ContactsTable';
import AddContactButton from '@/components/clients/AddContactButton';
import AddContactModal from '@/components/clients/AddContactModal';
import Authorized from '@/components/Authorized';
import { AUDIT_PERMISSIONS } from '@/constants/permissions';
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
  const router = useRouter();
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <ContactsTable
          data={contacts.map((c) => ({ ...c, licenseNumber: null }))}
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