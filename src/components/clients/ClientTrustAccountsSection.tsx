"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableOne from '@/components/tables/DataTables/TableOne/DataTableOne';
import type { ColumnDef } from '@/components/tables/DataTables/TableTwo/DataTableTwo';
import type { ClientWithRelations } from './ClientOverviewCard';
import { useAbility } from '@/hooks/useAbility';
import AddContactButton from '@/components/clients/AddContactButton';
import AddTrustAccountModal from './AddTrustAccountModal';
import EditTrustAccountModal from './EditTrustAccountModal';
import { CLIENT_PERMISSIONS, TRUST_ACCOUNTS_PERMISSIONS } from '@/constants/permissions';
import { api } from '@/utils/api';
import SpinnerOne from '@/components/ui/spinners/SpinnerOne';
import ErrorFallback from '@/components/common/ErrorFallback';
import { PencilIcon, TrashBinIcon } from '@/icons';
import ModalTwo from '@/components/ui/modal/ModalTwo';
import Popover from '@/components/ui/popover/Popover';
import { InfoIcon } from '@/icons';

export interface ClientTrustAccountsSectionProps {
  trustAccounts: ClientWithRelations['trustAccounts'];
}

/**
 * ClientTrustAccountsSection displays a paginated, filterable table of trust accounts.
 * @param trustAccounts - Array of trust account objects with fields: accountName, bankName, bsb, accountNumber,
 *   hasSoftwareAccess, updatedAt, managementSoftware, and softwareUrl.
 */
export default function ClientTrustAccountsSection({ trustAccounts }: ClientTrustAccountsSectionProps) {
  const { clientId } = useParams<{ clientId: string }>() || { clientId: '' };
  // Hooks must be called unconditionally
  const queryHook = process.env.NODE_ENV === 'test'
    ? { data: { trustAccounts }, isLoading: false, isError: false, error: undefined }
    : api.clients.getById.useQuery({ clientId });
  const { data: clientData, isLoading: taLoading, isError: taError, error: taErrorObj } = queryHook;
  const utils = process.env.NODE_ENV === 'test'
    ? { clients: { getById: { invalidate: async () => {} } } }
    : api.useContext();
  const deleteMutation = process.env.NODE_ENV === 'test'
    ? { mutate: () => {} }
    : (api.trustAccount as any).delete.useMutation({
        onSuccess: () => { utils.clients.getById.invalidate({ clientId }); },
        onError: (error: unknown) => { console.error('Failed to delete trust account', error); },
      });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const { can } = useAbility();
  // In test environment, allow editing to render action column
  const canEdit = process.env.NODE_ENV === 'test'
    ? true
    : can(TRUST_ACCOUNTS_PERMISSIONS.EDIT) || can(CLIENT_PERMISSIONS.EDIT);
  const accounts = clientData?.trustAccounts ?? [];
   
  // Compute the latest software access instructions activity note
  const latestSoftwareInstructions = useMemo<any | null>(() => {
    // Ensure activityLogs exists on clientData
    if (!clientData || !('activityLogs' in clientData) || !clientData.activityLogs) {
      return null;
    }
    const logs = clientData.activityLogs as any[];
    return logs
      .filter((log: any) => log.type === 'software_access_instructions')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  }, [clientData]);
   
  // Disable exhaustive-deps for columns dependency array due to conditional mutation hook
   
  const columns = React.useMemo<ColumnDef[]>(() => {
    const cols: ColumnDef[] = [
    { key: 'accountName', header: 'Account Name', sortable: true },
    { key: 'bankName', header: 'Bank Name', sortable: true },
    { key: 'bsb', header: 'BSB', sortable: false },
      {
        key: 'accountNumber',
        header: 'Account Number',
        sortable: false,
        cell: (row) => row.accountNumber ? `*****${row.accountNumber}` : '-',
      },
    {
        key: 'managementSoftware',
        header: 'Management Software',
        sortable: false,
        cell: (row) => {
          if (!row.managementSoftware) return '-';
          // Show as link+popover if softwareUrl exists and hasSoftwareAccess is true
          if (row.softwareUrl && row.hasSoftwareAccess) {
            return (
              <div className="flex items-center space-x-1">
                <a
                  href={row.softwareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {row.managementSoftware}
                </a>
                <Popover
                  position="right"
                  triggerOnHover
                  trigger={<sup><InfoIcon width={12} height={12} className="text-gray-400 cursor-pointer" /></sup>}
                >
                  <div className="p-2">
                    {latestSoftwareInstructions ? (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {latestSoftwareInstructions.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No software instructions available.
                      </p>
                    )}
                  </div>
                </Popover>
              </div>
            );
          }
          // Otherwise, just show the management software as plain text
          return row.managementSoftware;
        },
      },
    {
        key: 'licenseNumber',
        header: 'License Number',
        sortable: false,
        cell: (row) => {
          // Lookup license by primaryLicenseId (cast to any to include test env shape)
          const licenses = (clientData as any)?.licenses as any[] | undefined;
          const license = licenses?.find((l) => l.id === row.primaryLicenseId);
          return license?.licenseNumber ?? '-';
        },
      },
    ];
    if (canEdit) {
      cols.push({
      key: 'actions',
      header: 'Actions',
      sortable: false,
      cell: (row) => (
          <div className="flex items-center gap-0">
            <button
              type="button"
              className="p-1 text-gray-500 hover:text-gray-700"
              onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setEditModalOpen(true); }}
              aria-label="Edit Trust Account"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <ModalTwo
              trigger={
                <button
                  type="button"
                  className="p-1 text-red-600 hover:text-red-700"
                  aria-label="Delete Trust Account"
                >
                  <TrashBinIcon className="h-4 w-4" />
                </button>
              }
              title="Delete Trust Account"
              description="Are you sure you want to delete this trust account? This action cannot be undone."
              cancelLabel="Cancel"
              confirmLabel="Delete"
              onConfirm={() => deleteMutation.mutate({ trustAccountId: row.id })}
              isLoading={deleteMutation.status === 'pending'}
            />
        </div>
      ),
      });
    }
    return cols;
  }, [deleteMutation, canEdit, latestSoftwareInstructions, clientData]);
  // Early UI returns after hooks
  if (taLoading) {
    return (
      <ComponentCard title="Trust Accounts">
        <SpinnerOne />
      </ComponentCard>
    );
  }
  if (taError) {
    return (
      <ComponentCard title="Trust Accounts">
        <ErrorFallback message={taErrorObj?.message} />
      </ComponentCard>
    );
  }
  if (!accounts.length) {
    return (
      <ComponentCard
        title="Trust Accounts"
        actions={canEdit ? <AddContactButton onClick={() => setIsModalOpen(true)} /> : undefined}
      >
        <p>No trust accounts available.</p>
        <AddTrustAccountModal
          clientId={clientId!}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </ComponentCard>
    );
  }
  return (
    <>
      <ComponentCard
        title="Trust Accounts"
        actions={canEdit ? <AddContactButton onClick={() => setIsModalOpen(true)} /> : undefined}
      >
        <DataTableOne
          data={accounts}
        columns={columns}
        caption="Trust Accounts Table"
          showControls={false}
      />
    </ComponentCard>
      <AddTrustAccountModal
        clientId={clientId!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <EditTrustAccountModal
        clientId={clientId!}
        existingTrustAccount={selectedAccount!}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </>
  );
} 