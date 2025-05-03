import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableTwo, { ColumnDef } from '@/components/tables/DataTables/TableTwo/DataTableTwo';
import type { ClientWithRelations } from './ClientOverviewCard';
import Badge from '@/components/ui/badge/Badge';

export interface ClientTrustAccountsSectionProps {
  trustAccounts: ClientWithRelations['trustAccounts'];
}

export default function ClientTrustAccountsSection({ trustAccounts }: ClientTrustAccountsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
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
  // Filter trust accounts based on search term
  const filteredAccounts = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (trustAccounts ?? []).filter(acc =>
      (acc.accountName?.toLowerCase().includes(term) ||
       acc.bankName.toLowerCase().includes(term) ||
       acc.bsb?.toLowerCase().includes(term) ||
       acc.accountNumber?.toLowerCase().includes(term) ||
       acc.managementSoftware?.toLowerCase().includes(term))
    );
  }, [trustAccounts, searchTerm]);
  useEffect(() => { setCurrentPage(1); }, [filteredAccounts]);
  if (!trustAccounts || trustAccounts.length === 0) {
    return (
      <ComponentCard title="Trust Accounts">
        <p>No trust accounts available.</p>
      </ComponentCard>
    );
  }
  return (
    <ComponentCard title="Trust Accounts">
      <DataTableTwo
        data={filteredAccounts}
        columns={columns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        caption="Trust Accounts Table"
      />
    </ComponentCard>
  );
} 