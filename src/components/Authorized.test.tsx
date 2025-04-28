import React from 'react';
import { render, screen } from '@testing-library/react';
import Authorized from './Authorized';
import { vi, type Mock } from 'vitest';
import { useAbility } from '@/hooks/useAbility';
import '@testing-library/jest-dom';

// Mock useAbility hook
vi.mock('@/hooks/useAbility');
const mockUseAbility = useAbility as unknown as Mock;

describe('Authorized Component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders children when permission is granted', () => {
    mockUseAbility.mockReturnValue({ can: () => true, cannot: () => false });
    render(
      <Authorized action="test:action">
        <div data-testid="child">Allowed Content</div>
      </Authorized>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback when permission is denied', () => {
    mockUseAbility.mockReturnValue({ can: () => false, cannot: () => true });
    render(
      <Authorized action="test:action" fallback={<div data-testid="fallback">No Access</div>}>
        <div data-testid="child">Allowed Content</div>
      </Authorized>
    );
    expect(screen.queryByTestId('child')).toBeNull();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('renders nothing when permission is denied and no fallback provided', () => {
    mockUseAbility.mockReturnValue({ can: () => false, cannot: () => true });
    const { container } = render(
      <Authorized action="test:action">
        <div data-testid="child">Allowed Content</div>
      </Authorized>
    );
    expect(container).toBeEmptyDOMElement();
  });
}); 