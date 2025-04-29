import React from 'react';
import { render, screen } from '@testing-library/react';
import PhonePage from './page';
import { vi, type Mock } from 'vitest';
import { useAbility } from '@/hooks/useAbility';
import '@testing-library/jest-dom';

// Mock useAbility hook
vi.mock('@/hooks/useAbility');
const mockUseAbility = useAbility as unknown as Mock;

// Mock useDebounce to return input value immediately
vi.mock('@/hooks/useDebounce', () => ({
  __esModule: true,
  default: (value: unknown) => value,
}));

// Mock api hooks
vi.mock('@/utils/api', () => ({
  __esModule: true,
  api: {
    clients: {
      getAll: { useQuery: () => ({ data: { items: [] }, isLoading: false }) },
      getById: { useQuery: () => ({ data: { clientName: 'Test', contacts: [] }, isLoading: false }) },
    },
    phone: {
      makePstnCall: { useMutation: () => ({ status: 'idle', error: null, data: null, mutate: () => {} }) },
    },
  },
}));

// Mock PageBreadcrumb component
vi.mock('@/components/common/PageBreadCrumb', () => ({
  __esModule: true,
  default: ({ pageTitle }: { pageTitle: string }) => <div>{pageTitle}</div>,
}));

describe('PhonePage Authorization', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders fallback when permission denied', () => {
    mockUseAbility.mockReturnValue({ can: () => false, cannot: () => true });
    render(<PhonePage />);
    expect(screen.getByText(/You do not have permission to access Phone features\./i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Phone/i })).toBeNull();
  });

  it('renders main content when permission granted', () => {
    mockUseAbility.mockReturnValue({ can: () => true, cannot: () => false });
    render(<PhonePage />);
    expect(screen.getByRole('heading', { name: /Phone/i })).toBeInTheDocument();
    expect(screen.queryByText(/You do not have permission to access Phone features\./i)).toBeNull();
  });
}); 