import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
// Mock Next.js useRouter to avoid invariant error during tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
// Mock the API data fetching hook
vi.mock('@/utils/api', () => ({
  api: {
    useUtils: () => ({ clients: { getAll: { prefetch: vi.fn() } } }),
    clients: {
      getAll: {
        useQuery: () => ({ data: { items: [], totalCount: 0 }, isLoading: false, error: null }),
      },
    },
  },
}));
// Mock UI components to simplify rendering
vi.mock('@/components/common/PageBreadCrumb', () => ({ default: () => <div /> }));
vi.mock('@/components/common/ComponentCard', () => ({ default: ({ children, actions }) => <div>{actions}{children}</div> }));
vi.mock('@/components/ui/notification/Notification', () => ({ default: () => <div /> }));
vi.mock('@/components/tables/DataTables/TableTwo/DataTableTwo', () => ({ default: () => <div /> }));
vi.mock('@/components/ui/badge/Badge', () => ({ default: () => <div /> }));

import ClientsPage from './page';
import * as rbacModule from '@/context/RbacContext';

describe('ClientsPage RBAC', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows unauthorized message to users without a recognized role', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: null, permissions: [], canAccess: () => false });
    render(<ClientsPage />);
    const message = screen.getByText(/you are not authorized to view clients/i);
    expect(message).toBeTruthy();
  });

  test('allows Admin to view page and see Add New Client button', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Admin', permissions: [], canAccess: () => true });
    render(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    expect(addButton).toBeTruthy();
  });

  test('allows Manager to view page without Add New Client button', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Manager', permissions: [], canAccess: () => true });
    render(<ClientsPage />);
    expect(screen.queryByRole('button', { name: /add new client/i })).toBeNull();
    const title = screen.getByText(/clients/i);
    expect(title).toBeTruthy();
  });

  test('allows Client to view page without Add New Client button', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Client', permissions: [], canAccess: () => true });
    render(<ClientsPage />);
    expect(screen.queryByRole('button', { name: /add new client/i })).toBeNull();
    const titleClient = screen.getByText(/clients/i);
    expect(titleClient).toBeTruthy();
  });
}); 