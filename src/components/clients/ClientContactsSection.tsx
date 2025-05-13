"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import ContactsTable from './ContactsTable';
import AddContactButton from '@/components/clients/AddContactButton';
import AddContactModal from '@/components/clients/AddContactModal';
import { api } from '@/utils/api';
import Authorized from '@/components/Authorized';
import { CONTACT_PERMISSIONS } from '@/constants/permissions';
import ModalTwo from '@/components/ui/modal/ModalTwo';
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
  const utils = api.useContext();
  const deleteMutation = api.contact.deleteContact.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ clientId });
    },
  });

  // Fetch all licenses for all contacts in a single query
  const contactIds = contacts.map(c => c.id).filter((id): id is string => typeof id === 'string');
  const { data: licenses = [] } = api.license.getByContactIds.useQuery({ contactIds }, { enabled: contactIds.length > 0 });

  // Map contacts to include licenseNumber from the first license (if any)
  const contactsWithLicense = contacts.map(contact => {
    const license = licenses.find(l => l.contactId === contact.id);
    return {
      ...contact,
      licenseNumber: license?.licenseNumber ?? null,
    };
  });

  return (
    <>
      <ComponentCard
        title="Contacts"
        actions={
          <Authorized action={CONTACT_PERMISSIONS.EDIT}>
            <AddContactButton onClick={() => setIsModalOpen(true)} />
          </Authorized>
        }
      >
        {(!contacts || contacts.length === 0) ? (
          <p>No contacts available.</p>
        ) : (
          <ContactsTable
            data={contactsWithLicense}
            clientId={clientId}
            onRowClick={(row) => router.push(`/contacts/${row.id}`)}
            onDelete={(row) => deleteMutation.mutate({ contactId: row.id! })}
          />
        )}
      </ComponentCard>
      <AddContactModal
        clientId={clientId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* Delete handled in ContactsTable via ModalTwo */}
    </>
  );
} 