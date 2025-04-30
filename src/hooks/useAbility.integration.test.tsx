import React from 'react';
import { render } from '@testing-library/react';
import { PermissionContext, PermissionContextValue } from '@/contexts/PermissionContext';
import { useAbility } from '@/hooks/useAbility';
import { vi } from 'vitest';

function IntegrationTestComp() {
  const { can } = useAbility();
  return <div data-testid="result">{String(can('any'))}</div>;
}

describe('useAbility Integration Tests', () => {
  it('should bypass permissions for Developer role', () => {
    const contextValue: PermissionContextValue = {
      roles: ['Developer'],
      permissions: [],
      can: vi.fn(() => false),
      cannot: vi.fn(),
      refreshPermissions: vi.fn(async () => {}),
    };
    const { getByTestId } = render(
      <PermissionContext.Provider value={contextValue}>
        <IntegrationTestComp />
      </PermissionContext.Provider>
    );
    expect(getByTestId('result').textContent).toBe('true');
  });

  it('should respect actual permissions for non-developer roles', () => {
    const contextValue: PermissionContextValue = {
      roles: ['User'],
      permissions: ['allowed'],
      can: (perm: string) => perm === 'allowed',
      cannot: (perm: string) => perm !== 'allowed',
      refreshPermissions: vi.fn(async () => {}),
    };
    const { getByTestId } = render(
      <PermissionContext.Provider value={contextValue}>
        <IntegrationTestComp />
      </PermissionContext.Provider>
    );
    expect(getByTestId('result').textContent).toBe('false');
  });
}); 