import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableOne from '@/components/tables/DataTables/TableOne/DataTableOne';
import type { ColumnDef } from '@/components/tables/DataTables/TableTwo/DataTableTwo';
import type { ClientWithRelations } from './ClientOverviewCard';
import Badge from '@/components/ui/badge/Badge';

export interface ClientTrustAccountsSectionProps {
  trustAccounts: ClientWithRelations['trustAccounts'];
}

/**
 * ClientTrustAccountsSection displays a paginated, filterable table of trust accounts.
 * @param trustAccounts - Array of trust account objects with fields: accountName, bankName, bsb, accountNumber,
 *   hasSoftwareAccess, updatedAt, managementSoftware, and softwareUrl.
 */
export default function ClientTrustAccountsSection({ trustAccounts }: ClientTrustAccountsSectionProps) {
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
      cell: (row) =>
        row.softwareUrl ? (
          <a
            href={row.softwareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open in {row.managementSoftware}
          </a>
        ) : null,
    },
  ], []);
  if (!trustAccounts || trustAccounts.length === 0) {
    return (
      <ComponentCard title="Trust Accounts">
        <p>No trust accounts available.</p>
      </ComponentCard>
    );
  }
  return (
    <ComponentCard title="Trust Accounts">
      <DataTableOne
        data={trustAccounts}
        columns={columns}
        caption="Trust Accounts Table"
      />
    </ComponentCard>
  );
} 