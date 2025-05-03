import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientTrustAccountsSection from './ClientTrustAccountsSection';
import { SessionProvider } from 'next-auth/react';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { vi } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock DataTableTwo to avoid rendering complex SVGs and CSS that break tests
vi.mock('@/components/tables/DataTables/TableTwo/DataTableTwo', () => ({
  __esModule: true,
  default: ({ data, columns }: { data: any[]; columns: any[] }) => (
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
        managementSoftware: 'Xero',
        softwareUrl: 'https://app.xero.com',
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
    expect(screen.getByText('Software Access')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check row content
    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByText('123-456')).toBeInTheDocument();
    expect(screen.getByText('000111')).toBeInTheDocument();

    // Badge
    expect(screen.getByText('Yes')).toBeInTheDocument();

    // Action Link
    const actionLink = screen.getByText('Open in Xero');
    expect(actionLink).toHaveAttribute('href', 'https://app.xero.com');
  });
}); 