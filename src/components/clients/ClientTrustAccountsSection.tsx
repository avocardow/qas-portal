"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableOne from '@/components/tables/DataTables/TableOne/DataTableOne';
import type { ColumnDef } from '@/components/tables/DataTables/TableTwo/DataTableTwo';
import type { ClientWithRelations } from './ClientOverviewCard';
import Badge from '@/components/ui/badge/Badge';
import Authorized from '@/components/Authorized';
import AddTrustAccountButton from './AddTrustAccountButton';
import AddTrustAccountModal from './AddTrustAccountModal';
import EditTrustAccountButton from './EditTrustAccountButton';
import EditTrustAccountModal from './EditTrustAccountModal';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const columns = React.useMemo<ColumnDef[]>(() => [
    { key: 'accountName', header: 'Account Name', sortable: true },
    { key: 'bankName', header: 'Bank Name', sortable: true },
    { key: 'bsb', header: 'BSB', sortable: false },
    { key: 'accountNumber', header: 'Account Number', sortable: false },
    {
      key: 'hasSoftwareAccess',
      header: 'Software Access',
      sortable: false,
      cell: (row) =>
        row.hasSoftwareAccess ? (
          <Badge variant="light" color="success" size="sm">Yes</Badge>
        ) : (
          <Badge variant="light" color="error" size="sm">No</Badge>
        ),
    },
    {
      key: 'updatedAt',
      header: 'Last Reconciliation',
      sortable: true,
      cell: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
    { key: 'managementSoftware', header: 'Software', sortable: false },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Authorized action={CLIENT_PERMISSIONS.EDIT}>
            <EditTrustAccountButton onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setEditModalOpen(true); }} />
          </Authorized>
          {row.softwareUrl && (
            <a
              href={row.softwareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open in {row.managementSoftware}
            </a>
          )}
        </div>
      ),
    },
  ], []);
  if (!trustAccounts || trustAccounts.length === 0) {
    return (
      <ComponentCard
        title="Trust Accounts"
        actions={
          <Authorized action={CLIENT_PERMISSIONS.EDIT}>
            <AddTrustAccountButton onClick={() => setIsModalOpen(true)} />
          </Authorized>
        }
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
        actions={
          <Authorized action={CLIENT_PERMISSIONS.EDIT}>
            <AddTrustAccountButton onClick={() => setIsModalOpen(true)} />
          </Authorized>
        }
      >
        <DataTableOne
          data={trustAccounts}
          columns={columns}
          caption="Trust Accounts Table"
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