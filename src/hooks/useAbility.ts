"use client";
import { useMemo, useCallback } from 'react';
import { usePermissionContext } from '@/contexts/PermissionContext';
import type { Permission } from '@/policies/permissions';

export interface UseAbilityHook {
  can: (permission: Permission | string) => boolean;
  cannot: (permission: Permission | string) => boolean;
}

export function useAbility(): UseAbilityHook {
  const { can: contextCan, roles, permissions } = usePermissionContext();

  // Reset cache when roles or permissions change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map<string, boolean>(), [roles, permissions]);

  const can = useCallback((permission: Permission | string): boolean => {
    const key = permission.toString();
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = contextCan(permission);
    cache.set(key, result);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[useAbility] permission "${key}" check: ${result}`);
    }
    return result;
  }, [cache, contextCan]);

  const cannot = useCallback((permission: Permission | string): boolean => !can(permission), [can]);

  return { can, cannot };
} 