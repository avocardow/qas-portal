import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import NotificationDropdown from '../NotificationDropdown';
import { api } from '@/utils/api';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock tRPC API
vi.mock('@/utils/api', () => ({
  api: {
    notification: {
      getUnread: {
        useQuery: vi.fn()
      },
      getCount: {
        useQuery: vi.fn()
      },
      subscribe: {
        useQuery: vi.fn()
      },
      markAsRead: {
        useMutation: vi.fn()
      },
      markAllAsRead: {
        useMutation: vi.fn()
      }
    }
  }
}));

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn()
};

const mockMutationResult = {
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  data: null,
  reset: vi.fn()
};

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'client_assignment',
    message: '**John Smith** has been assigned to client **ABC Corp**',
    linkUrl: null,
    isRead: false,
    entityId: 'client-123',
    createdAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 'notif-2',
    type: 'audit_assignment',
    message: 'You have been assigned to audit **DEF Ltd** for 2024',
    linkUrl: '/audits/audit-456',
    isRead: true,
    entityId: 'audit-456',
    createdAt: new Date('2024-01-14T15:30:00Z')
  }
];

describe('NotificationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock router
    (useRouter as vi.Mock).mockReturnValue(mockRouter);
    
    // Default mock implementations
    (api.notification.getUnread.useQuery as vi.Mock).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      refetch: vi.fn().mockResolvedValue({ data: mockNotifications }),
      error: null
    });
    
    (api.notification.getCount.useQuery as vi.Mock).mockReturnValue({
      data: { count: 1 },
      refetch: vi.fn().mockResolvedValue({ data: { count: 1 } })
    });
    
    (api.notification.subscribe.useQuery as vi.Mock).mockReturnValue({
      data: {
        type: 'initial_state',
        notifications: [mockNotifications[0]], // only unread ones
        timestamp: '2024-01-15T12:00:00Z',
        note: 'This is a placeholder'
      },
      error: null
    });
    
    (api.notification.markAsRead.useMutation as vi.Mock).mockReturnValue(mockMutationResult);
    (api.notification.markAllAsRead.useMutation as vi.Mock).mockReturnValue(mockMutationResult);
  });

  describe('Basic rendering', () => {
    it('renders notification button', () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('shows unread count badge when there are unread notifications', () => {
      render(<NotificationDropdown />);
      
      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
    });

    it('does not show badge when unread count is 0', () => {
      (api.notification.getCount.useQuery as vi.Mock).mockReturnValue({
        data: { count: 0 },
        refetch: vi.fn()
      });
      
      render(<NotificationDropdown />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('shows 99+ when unread count exceeds 99', () => {
      (api.notification.getCount.useQuery as vi.Mock).mockReturnValue({
        data: { count: 150 },
        refetch: vi.fn()
      });
      
      render(<NotificationDropdown />);
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  describe('Dropdown functionality', () => {
    it('opens dropdown when button is clicked', async () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    it('shows loading state when notifications are loading', async () => {
      (api.notification.getUnread.useQuery as vi.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        refetch: vi.fn(),
        error: null
      });
      
      render(<NotificationDropdown />);
      
      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('shows error state when there is an error', async () => {
      (api.notification.getUnread.useQuery as vi.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        refetch: vi.fn(),
        error: new Error('Failed to fetch')
      });
      
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
      });
    });

    it('shows empty state when there are no notifications', async () => {
      (api.notification.getUnread.useQuery as vi.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        refetch: vi.fn(),
        error: null
      });
      
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
      });
    });
  });

  describe('Notification rendering', () => {
    it('renders notification messages', async () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/John Smith/)).toBeInTheDocument();
      });
    });

    it('shows mark all as read button when there are unread notifications', async () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Mark all read')).toBeInTheDocument();
      });
    });
  });

  describe('API interactions', () => {
    it('calls mark as read when notification is clicked', async () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/John Smith/)).toBeInTheDocument();
      });
      
      const notification = screen.getByText(/John Smith/).closest('li');
      if (notification) {
        fireEvent.click(notification);
        
        await waitFor(() => {
          expect(mockMutationResult.mutateAsync).toHaveBeenCalledWith({
            notificationIds: ['notif-1']
          });
        });
      }
    });

    it('calls navigation when notification is clicked', async () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/John Smith/)).toBeInTheDocument();
      });
      
      const notification = screen.getByText(/John Smith/).closest('li');
      if (notification) {
        fireEvent.click(notification);
        
        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalledWith('/clients/client-123');
        });
      }
    });

    it('calls mark all as read when button is clicked', async () => {
      render(<NotificationDropdown />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Mark all read')).toBeInTheDocument();
      });
      
      const markAllButton = screen.getByText('Mark all read');
      fireEvent.click(markAllButton);
      
      await waitFor(() => {
        expect(mockMutationResult.mutateAsync).toHaveBeenCalledWith({
          notificationIds: ['notif-1']
        });
      });
    });
  });
}, { timeout: 5000 }); 