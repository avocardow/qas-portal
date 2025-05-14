import React from "react";
import DataTableOne from "@/components/tables/DataTables/TableOne/DataTableOne";
// import { useRouter } from "next/navigation"; // Removed unused import
import { useAbility } from '@/hooks/useAbility';
import { CONTACT_PERMISSIONS, CLIENT_PERMISSIONS } from '@/constants/permissions';
import { PencilIcon, TrashBinIcon } from '@/icons';
import ModalTwo from '@/components/ui/modal/ModalTwo';
import EditContactModal from './EditContactModal';

interface ContactRow {
  id?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  title?: string | null;
  // licenseNumber is optional since API may not supply it
  licenseNumber?: string | null;
}

export interface ContactsTableProps {
  data: ContactRow[];
  clientId: string;
  onRowClick?: (row: ContactRow) => void;
  onDelete?: (row: ContactRow) => void;
}

export default function ContactsTable({ data, clientId, onRowClick, onDelete }: ContactsTableProps) {
  const { can } = useAbility();
  const canEdit = can(CONTACT_PERMISSIONS.EDIT) || can(CLIENT_PERMISSIONS.EDIT);
  const columns = React.useMemo(() => {
    const cols = [
    { key: "name", header: "Name", sortable: true },
    { key: "phone", header: "Phone", sortable: false },
    { key: "email", header: "Email", sortable: false },
    { key: "title", header: "Contact Type", sortable: false },
    { key: "licenseNumber", header: "License Number", sortable: false },
    ];
    if (canEdit) {
      cols.push({ key: "actions", header: "Actions", sortable: false });
    }
    return cols;
  }, [canEdit]);
  const [editContactId, setEditContactId] = React.useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  // Maximum length for displaying email before truncation
  const MAX_EMAIL_LENGTH = 25;
  const dataWithActions = data.map((row) => {
    const rawEmail = row.email?.trim() ?? '';
    const displayEmail = rawEmail.length > MAX_EMAIL_LENGTH
      ? rawEmail.slice(0, MAX_EMAIL_LENGTH) + '...'
      : rawEmail;
    return {
      ...row,
      email: rawEmail
        ? (
            <a
              href={`mailto:${rawEmail}`}
              className="text-blue-600 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {displayEmail}
            </a>
          )
        : row.email,
      actions: canEdit ? (
        <div className="flex items-center gap-0">
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setEditContactId(row.id!);
              setEditModalOpen(true);
            }}
            aria-label="Edit Contact"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          {onDelete && (
            <ModalTwo
              trigger={
                <button
                  type="button"
                  className="p-1 text-red-600 hover:text-red-700"
                  aria-label="Delete Contact"
                >
                  <TrashBinIcon className="h-4 w-4" />
                </button>
              }
              title="Delete Contact"
              description="Are you sure you want to delete this contact? This action cannot be undone."
              cancelLabel="Cancel"
              confirmLabel="Delete"
              onConfirm={() => onDelete(row)}
            />
          )}
          {editContactId === row.id && (
            <EditContactModal
              contactId={row.id!}
              clientId={clientId}
              isOpen={editModalOpen}
              onClose={() => { setEditModalOpen(false); setEditContactId(null); }}
            />
          )}
        </div>
      ) : null,
    };
  });
  return (
    <DataTableOne
      data={dataWithActions}
      columns={columns}
      onRowClick={(row) => onRowClick?.(row)}
      caption="Contacts"
      showControls={false}
    />
  );
} 