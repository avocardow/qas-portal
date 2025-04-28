import React from 'react';
import { render, screen } from '@testing-library/react';
import { PermissionContext, PermissionContextValue } from '@/contexts/PermissionContext';
import { useAbility } from './useAbility';
import { vi } from 'vitest';

function TestComp() {
  const { can, cannot } = useAbility();
  const c1 = can('foo');
  const c2 = can('foo');
  const n1 = cannot('foo');
  const n2 = cannot('bar');
  return (
    <>
      <div data-testid="can1">{String(c1)}</div>
      <div data-testid="can2">{String(c2)}</div>
      <div data-testid="cannot1">{String(n1)}</div>
      <div data-testid="cannot2">{String(n2)}</div>
    </>
  );
}

describe('useAbility hook', () => {
  it('caches permission checks and returns correct values', () => {
    const contextCan = vi.fn((permission) => permission === 'foo');
    const contextCannot = vi.fn((permission) => !contextCan(permission));
    const contextValue: PermissionContextValue = {
      roles: [],
      permissions: [],
      can: contextCan,
      cannot: contextCannot,
      refreshPermissions: async () => {},
    };

    render(
      <PermissionContext.Provider value={contextValue}>
        <TestComp />
      </PermissionContext.Provider>
    );

    expect(screen.getByTestId('can1').textContent).toBe('true');
    expect(screen.getByTestId('can2').textContent).toBe('true');
    expect(screen.getByTestId('cannot1').textContent).toBe('false');
    expect(screen.getByTestId('cannot2').textContent).toBe('true');

    expect(contextCan).toHaveBeenCalledTimes(2);
    expect(contextCan).toHaveBeenCalledWith('foo');
    expect(contextCan).toHaveBeenCalledWith('bar');
  });
}); 