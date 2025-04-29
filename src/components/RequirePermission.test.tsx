import React from 'react';
import { render, screen } from '@testing-library/react';
import RequirePermission from './RequirePermission';
import { vi, type Mock } from 'vitest';
import { useAbility } from '@/hooks/useAbility';
import '@testing-library/jest-dom';

// Mock the useAbility hook
vi.mock('@/hooks/useAbility');
const mockUseAbility = useAbility as unknown as Mock;

describe('RequirePermission Component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders children when permission is granted', () => {
    // can returns true for the tested permission
    mockUseAbility.mockReturnValue({ can: (perm: string) => perm === 'permX', cannot: (perm: string) => perm !== 'permX', refreshPermissions: async () => {} });
    render(
      <RequirePermission permission="permX">
        <div data-testid="child">Allowed Content</div>
      </RequirePermission>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback when permission is denied', () => {
    // can returns false for any permission
    mockUseAbility.mockReturnValue({ can: () => false, cannot: () => true, refreshPermissions: async () => {} });
    render(
      <RequirePermission permission="permY" fallback={<div data-testid="fallback">No Access</div>}>
        <div data-testid="child">Allowed Content</div>
      </RequirePermission>
    );
    expect(screen.queryByTestId('child')).toBeNull();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('renders nothing when denied and no fallback provided', () => {
    mockUseAbility.mockReturnValue({ can: () => false, cannot: () => true, refreshPermissions: async () => {} });
    render(
      <RequirePermission permission="permZ">
        <div data-testid="child">Allowed Content</div>
      </RequirePermission>
    );
    // Should render default fallback when no explicit fallback prop is provided
    expect(screen.queryByTestId('child')).toBeNull();
    expect(screen.getByText('You are not authorized to access this content.')).toBeInTheDocument();
  });
}); 