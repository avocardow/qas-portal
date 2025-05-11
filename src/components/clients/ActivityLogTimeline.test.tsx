import React from 'react';
import { render, screen } from '@testing-library/react';
import ActivityLogTimeline, { ActivityLogEntry } from './ActivityLogTimeline';
import { vi } from 'vitest';
import { PermissionProvider } from '@/contexts/PermissionContext';

// Stub next-auth session to prevent requiring SessionProvider
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { role: 'Developer' } }, status: 'authenticated' }) }));
// Stub TRPC hooks
vi.mock('@/utils/api', () => ({
  api: {
    useContext: () => ({}),
    clients: {
      updateActivityLog: {
        useMutation: () => ({ mutateAsync: async () => {} }),
      },
    },
  },
}));
// Stub Modal to render children directly
vi.mock('@/components/ui/modal', () => ({ __esModule: true, Modal: ({ children }) => <>{children}</> }));
// Note: Popover is not used in these tests

describe('ActivityLogTimeline', () => {
  it('renders no logs message when entries empty', () => {
    render(
      <PermissionProvider>
        <ActivityLogTimeline entries={[]} contacts={[]} clientId="test-client" />
      </PermissionProvider>
    );
    expect(screen.getByText(/no activity logs/i)).toBeInTheDocument();
  });

  it('renders entries list when entries provided', () => {
    const entries: ActivityLogEntry[] = [
      { id: '1', type: 'note', content: 'Test log entry', createdAt: '2025-01-01T12:00:00Z', createdBy: 'user1' },
    ];
    const contacts = [{ id: 'user1', name: 'User One' }];
    render(
      <PermissionProvider>
        <ActivityLogTimeline entries={entries} contacts={contacts} clientId="test-client" />
      </PermissionProvider>
    );
    expect(screen.getByText('Test log entry')).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
}); 