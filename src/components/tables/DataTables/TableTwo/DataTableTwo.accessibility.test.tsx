import React from 'react';
import { vi } from 'vitest';
// Mock icons to avoid rendering inline SVG data URIs
vi.mock('../../../../icons', () => ({
  AngleDownIcon: () => <span aria-hidden="true" />,
  AngleUpIcon: () => <span aria-hidden="true" />,
  PencilIcon: () => <span aria-hidden="true" />,
  XMarkIcon: () => <span aria-hidden="true" />,
}));
import { render, screen } from '@testing-library/react';
import DataTableTwo from './DataTableTwo';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { SessionProvider } from 'next-auth/react';

function renderWithProviders(ui) {
  return render(
    <SessionProvider session={null}>
      <PermissionProvider>{ui}</PermissionProvider>
    </SessionProvider>
  );
}

describe('DataTableTwo Accessibility', () => {
  const defaultProps = {
    data: [],
    columns: undefined,
    onView: undefined,
    extraControls: undefined,
    totalDbEntries: 0,
    currentPage: 1,
    pageSize: 5,
    onPageChange: () => {},
    onItemsPerPageChange: () => {},
    isLoading: false,
    searchTerm: '',
    setSearchTerm: () => {},
  };

  test('renders table caption text', () => {
    renderWithProviders(<DataTableTwo {...defaultProps} />);
    expect(screen.getByText(/clients table/i)).toBeTruthy();
  });

  test('renders search input with testid', () => {
    renderWithProviders(<DataTableTwo {...defaultProps} />);
    const input = screen.getByTestId('datatable-search-input');
    expect(input).toBeTruthy();
  });

  test('renders page size select with testid', () => {
    renderWithProviders(<DataTableTwo {...defaultProps} />);
    const select = screen.getByTestId('datatable-select');
    expect(select).toBeTruthy();
  });

  test('does not render clear search button when searchTerm is empty', () => {
    renderWithProviders(<DataTableTwo {...defaultProps} />);
    const clearBtn = screen.queryByTestId('datatable-clear-button');
    expect(clearBtn).toBeNull();
  });

  test('renders clear search button when searchTerm provided', () => {
    renderWithProviders(<DataTableTwo {...defaultProps} searchTerm="foo" />);
    const clearBtn = screen.getByTestId('datatable-clear-button');
    expect(clearBtn).toBeTruthy();
  });
}); 