"use client";
import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Role, Permission, getPermissionsForRole } from '@/policies/permissions';
import { useSession } from 'next-auth/react';
import { impersonationService } from '@/lib/impersonationService';
import { useImpersonationContext } from '@/contexts/ImpersonationContext';

export interface PermissionContextValue {
  roles: Role[];
  permissions: Permission[];
  can: (permission: Permission | string) => boolean;
  cannot: (permission: Permission | string) => boolean;
  refreshPermissions: () => Promise<void>;
}

export const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export const usePermissionContext = (): PermissionContextValue => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within PermissionProvider');
  }
  return context;
};

// Props for PermissionProvider including children
interface PermissionProviderProps {
  children: ReactNode;
}

// PermissionProvider component
export const PermissionProvider = ({ children }: PermissionProviderProps) => {
  const { data: session } = useSession();
  // Subscribe to impersonation context if available
  let impersonationContext;
  try {
    impersonationContext = useImpersonationContext();
  } catch {
    impersonationContext = undefined;
  }
  const roles: Role[] = useMemo(() => {
    // Prefer context-driven impersonation, fallback to storage
    const imp = impersonationContext?.impersonatedRole ?? impersonationService.getImpersonatedRole();
    if (imp) {
      return [imp];
    }
    const roleName = session?.user.role;
    return roleName ? [roleName as Role] : [];
  }, [session?.user.role, impersonationContext?.impersonatedRole]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);

  // Create a callback to refresh permissions based on current roles
  const refreshPermissions = useCallback(async () => {
    try {
      const perms = roles.flatMap(role => getPermissionsForRole(role));
      setPermissions(perms);
      console.info('[PermissionContext] permissions refreshed', perms);
    } catch (error) {
      console.error('[PermissionContext] error refreshing permissions:', error);
    }
  }, [roles]);

  // Call refreshPermissions on mount and when roles change
  React.useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Poll for permission changes every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshPermissions();
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [refreshPermissions]);

  const can = useCallback((permission: Permission | string) => {
    // Developer bypass (case-insensitive)
    const isDeveloperRole = roles.some((r) => r.toLowerCase() === 'developer');
    if (isDeveloperRole) {
      return true;
    }
    return permissions.includes(permission as Permission);
  }, [permissions, roles]);

  const cannot = useCallback((permission: Permission | string) => !can(permission), [can]);

  return (
    <PermissionContext.Provider value={{ roles, permissions, can, cannot, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}; 