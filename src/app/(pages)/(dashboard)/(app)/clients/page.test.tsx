import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Mock Next.js useRouter to avoid invariant error during tests
// Shared mock for router.push
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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
vi.mock('@/components/common/ComponentCard', () => ({ default: ({ children, actions }: { children?: React.ReactNode; actions?: React.ReactNode }) => <div>{actions}{children}</div> }));
vi.mock('@/components/ui/notification/Notification', () => ({ default: () => <div /> }));
vi.mock('@/components/tables/DataTables/TableTwo/DataTableTwo', () => ({ default: () => <div /> }));
vi.mock('@/components/ui/badge/Badge', () => ({ default: () => <div /> }));

import ClientsPage from './page';
import * as rbacModule from '@/context/RbacContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import * as nextAuth from 'next-auth/react';

describe('ClientsPage RBAC', () => {
  beforeEach(() => {
    pushMock.mockClear();
    vi.spyOn(nextAuth, 'useSession').mockReturnValue({ data: { user: { role: 'Admin' } }, status: 'authenticated' });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderWithPermissionProvider(ui) {
    return render(<PermissionProvider>{ui}</PermissionProvider>);
  }

  test('shows unauthorized message to users without a recognized role', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: null, permissions: [], canAccess: () => false });
    renderWithPermissionProvider(<ClientsPage />);
    const message = screen.getByText(/you are not authorized to view clients/i);
    expect(message).toBeTruthy();
  });

  test('allows Admin to view page and see Add New Client button', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Admin', permissions: [], canAccess: () => true });
    renderWithPermissionProvider(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    expect(addButton).toBeTruthy();
  });

  test('allows Manager to view page without Add New Client button', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Manager', permissions: [], canAccess: () => true });
    renderWithPermissionProvider(<ClientsPage />);
    expect(screen.queryByRole('button', { name: /add new client/i })).toBeNull();
    const title = screen.getByText(/clients/i);
    expect(title).toBeTruthy();
  });

  test('allows Client to view page without Add New Client button', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Client', permissions: [], canAccess: () => true });
    renderWithPermissionProvider(<ClientsPage />);
    expect(screen.queryByRole('button', { name: /add new client/i })).toBeNull();
    const titleClient = screen.getByText(/clients/i);
    expect(titleClient).toBeTruthy();
  });

  test('routes to New Client page when Add New Client button is clicked', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Admin', permissions: [], canAccess: () => true });
    renderWithPermissionProvider(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    fireEvent.click(addButton);
    expect(pushMock).toHaveBeenCalledWith('/clients/new');
  });

  test('shows No clients found message when there are no clients', () => {
    vi.spyOn(rbacModule, 'useRbac').mockReturnValue({ role: 'Admin', permissions: [], canAccess: () => true });
    renderWithPermissionProvider(<ClientsPage />);
    expect(screen.getByText(/no clients found/i)).toBeTruthy();
  });
}); 