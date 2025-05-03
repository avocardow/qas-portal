import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import DataTableTwo, { ColumnDef } from '@/components/tables/DataTables/TableTwo/DataTableTwo';
import type { ClientWithRelations } from './ClientOverviewCard';

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
    { key: 'hasSoftwareAccess', header: 'Software Access', sortable: false },
    {
      key: 'updatedAt',
      header: 'Last Reconciliation',
      sortable: true,
      cell: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
    { key: 'managementSoftware', header: 'Management Software', sortable: false },
    { key: 'softwareUrl', header: 'Software URL', sortable: false },
  ], []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, trustAccounts]);
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
        data={trustAccounts}
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