import React, { createContext, useContext, ReactNode } from 'react';
import { Role, Permission, getPermissionsForRole } from '@/policies/permissions';

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
  roles: Role[];
  children: ReactNode;
}

// PermissionProvider component
export const PermissionProvider = ({ roles, children }: PermissionProviderProps) => {
  const [permissions, setPermissions] = React.useState<Permission[]>([]);

  React.useEffect(() => {
    // Initialize permissions based on roles
    const perms = roles.flatMap(role => getPermissionsForRole(role));
    setPermissions(perms);
  }, [roles]);

  const can = (permission: Permission | string) => {
    // Developer bypass
    if (roles.includes('Developer' as Role)) return true;
    return permissions.includes(permission as Permission);
  };

  const cannot = (permission: Permission | string) => !can(permission);

  const refreshPermissions = async () => {
    // Stub: no-op for now
    return Promise.resolve();
  };

  return (
    <PermissionContext.Provider value={{ roles, permissions, can, cannot, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}; 