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
import * as abilityModule from '@/hooks/useAbility';
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
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({ can: () => false, cannot: () => true });
    renderWithPermissionProvider(<ClientsPage />);
    const message = screen.getByText(/you are not authorized to view clients/i);
    expect(message).toBeTruthy();
  });

  test('allows Admin to view page and see Add New Client button', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({ can: () => true, cannot: () => false });
    renderWithPermissionProvider(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    expect(addButton).toBeTruthy();
  });

  test('allows Developer to view page and see Add New Client button', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({ can: () => true, cannot: () => false });
    renderWithPermissionProvider(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    expect(addButton).toBeTruthy();
  });

  test('routes to New Client page when Developer clicks Add New Client button', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({ can: () => true, cannot: () => false });
    renderWithPermissionProvider(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    fireEvent.click(addButton);
    expect(pushMock).toHaveBeenCalledWith('/clients/new');
  });

  test('shows disabled Add New Client button for Manager when lacking permissions', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({
      can: (permission) => permission === 'clients.view.status',
      cannot: (permission) => permission !== 'clients.view.status',
    });
    renderWithPermissionProvider(<ClientsPage />);
    const button = screen.queryByRole('button', { name: /add new client/i });
    expect(button).toBeNull();
  });

  test('shows disabled Add New Client button for Client when lacking permissions', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({
      can: (permission) => permission === 'clients.view.status',
      cannot: (permission) => permission !== 'clients.view.status',
    });
    renderWithPermissionProvider(<ClientsPage />);
    const button = screen.queryByRole('button', { name: /add new client/i });
    expect(button).toBeNull();
  });

  test('routes to New Client page when Add New Client button is clicked', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({ can: () => true, cannot: () => false });
    renderWithPermissionProvider(<ClientsPage />);
    const addButton = screen.getByRole('button', { name: /add new client/i });
    fireEvent.click(addButton);
    expect(pushMock).toHaveBeenCalledWith('/clients/new');
  });

  test('shows No clients found message when there are no clients', () => {
    vi.spyOn(abilityModule, 'useAbility').mockReturnValue({ can: () => true, cannot: () => false });
    renderWithPermissionProvider(<ClientsPage />);
    expect(screen.getByText(/no clients found/i)).toBeTruthy();
  });
}); 