import { vi } from 'vitest';
// Stub TRPC api to avoid context errors
vi.mock('@/utils/api', () => ({
  api: {
    useContext: () => ({ clients: { getById: { invalidate: () => {} } } }),
    clients: { getById: { useQuery: () => ({ data: { trustAccounts: [], licenses: [], activityLogs: [] }, isLoading: false, isError: false, error: undefined }) } },
    trustAccount: { delete: { useMutation: () => ({ mutate: () => {}, status: 'idle' }) },
                    update: { useMutation: () => ({ mutate: () => {}, status: 'idle' }) },
                    create: { useMutation: () => ({ mutate: () => {}, status: 'idle' }) },
                  },
    license: {
      getByLicenseNumber: { useQuery: () => ({ data: undefined }) },
      create: { useMutation: () => ({ mutate: () => {} }) },
    },
  },
}));
// Mock DataTableOne to avoid rendering complex SVGs and CSS that break tests
vi.mock('@/components/tables/DataTables/TableOne/DataTableOne', () => ({
  __esModule: true,
  default: ({ data, columns }: { data: unknown[]; columns: unknown[] }) => (
    <table>
      <thead>
        <tr>{columns.map(col => <th key={col.key}>{col.header}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>{columns.map(col => (
            <td key={col.key}>{col.cell ? col.cell(row) : row[col.key]}</td>
          ))}</tr>
        ))}
      </tbody>
    </table>
  ),
}));
// Stub useParams from next/navigation
vi.mock('next/navigation', () => ({ useParams: () => ({ clientId: 'test-client' }) }));
// Stub Popover to render children directly
vi.mock('@/components/ui/popover/Popover', () => ({ __esModule: true, default: ({ children }) => <>{children}</> }));
// Stub icon components including PlusIcon
vi.mock('@/icons', () => ({ __esModule: true, InfoIcon: () => <span>InfoIcon</span>, PencilIcon: () => <span>PencilIcon</span>, TrashBinIcon: () => <span>TrashBinIcon</span>, PlusIcon: () => <span>PlusIcon</span> }));
// Stub AddContactButton to avoid icon import
vi.mock('@/components/clients/AddContactButton', () => ({ __esModule: true, default: ({ onClick }) => <button onClick={onClick}>AddContact</button> }));
import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientTrustAccountsSection from './ClientTrustAccountsSection';
import { SessionProvider } from 'next-auth/react';
import { PermissionProvider } from '@/contexts/PermissionContext';

describe('ClientTrustAccountsSection', () => {
  it('shows no trust accounts message when list is empty', () => {
    render(
      <SessionProvider session={null}>
        <PermissionProvider>
          <ClientTrustAccountsSection trustAccounts={[]} />
        </PermissionProvider>
      </SessionProvider>
    );
    expect(screen.getByText('No trust accounts available.')).toBeInTheDocument();
  });

  it('renders table with trust account data and badge and action link', () => {
    const mockAccounts = [
      {
        id: '1',
        accountName: 'Test Account',
        bankName: 'Test Bank',
        bsb: '123-456',
        accountNumber: '000111',
        hasSoftwareAccess: true,
        updatedAt: '2025-01-01T00:00:00Z',
        managementSoftware: 'PropertyTree',
        softwareUrl: 'https://propertytree.com',
      },
    ];
    render(
      <SessionProvider session={null}>
        <PermissionProvider>
          <ClientTrustAccountsSection trustAccounts={mockAccounts} />
        </PermissionProvider>
      </SessionProvider>
    );

    // Check headers
    expect(screen.getByText('Account Name')).toBeInTheDocument();
    expect(screen.getByText('Bank Name')).toBeInTheDocument();
    expect(screen.getByText('BSB')).toBeInTheDocument();
    expect(screen.getByText('Account Number')).toBeInTheDocument();
    expect(screen.getByText('Management Software')).toBeInTheDocument();
    expect(screen.getByText('License Number')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check row content
    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByText('123-456')).toBeInTheDocument();
    expect(screen.getByText('*****000111')).toBeInTheDocument();

    // Management Software link should be 'PropertyTree'
    const softwareLink = screen.getByText('PropertyTree');
    expect(softwareLink).toHaveAttribute('href', 'https://propertytree.com');

    // Action Link
    const actionLink = screen.getByText('PropertyTree');
    expect(actionLink).toHaveAttribute('href', 'https://propertytree.com');
  });
}); 