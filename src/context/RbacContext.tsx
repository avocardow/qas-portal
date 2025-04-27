"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { rbacPolicy, type Role } from "@/utils/rbacPolicy";

export type RbacContextType = {
  /** The _effective_ role (impersonated if Developer) */
  role: Role | null;
  permissions: string[];
  canAccess: (permission: string) => boolean;

  /** Which role you're impersonating (only for Developer) */
  impersonatedRole: Role | null;
  setImpersonatedRole: (role: Role | null) => void;

  /** Your real session role, before impersonation */
  sessionRole: Role | null;
};

const RbacContext = createContext<RbacContextType | undefined>(undefined);

export const useRbac = (): RbacContextType => {
  const context = useContext(RbacContext);
  if (!context) {
    // If no RbacProvider is found in the React tree, return a default no-access context
    return {
      role: null,
      permissions: [],
      canAccess: () => false,
      impersonatedRole: null,
      setImpersonatedRole: () => {},
      sessionRole: null,
    };
  }
  return context;
};

export const useRole = (): Role | null => {
  return useRbac().role;
};

export const usePermissions = (): string[] => {
  return useRbac().permissions;
};

export const usePermission = (permission: string): boolean => {
  return useRbac().canAccess(permission);
};

/**
 * canAccess utility function when you have a role outside of hooks.
 * @param permission - Permission string to check
 * @param role - User role
 */
export const canAccess = (permission: string, role: Role | null): boolean => {
  if (!role) return false;
  return (rbacPolicy[role] || []).includes(permission);
};

export const RbacProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();

  const [sessionRole, setSessionRole] = useState<Role | null>(null);

  const [impersonatedRole, setImpersonatedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      setSessionRole(session.user.role as Role);
    } else {
      setSessionRole(null);
    }
  }, [session, status]);

  const effectiveRole =
    sessionRole === "Developer" && impersonatedRole
      ? impersonatedRole
      : sessionRole;
  const effectivePermissions = effectiveRole
    ? rbacPolicy[effectiveRole]
    : [];

  const canAccessFn = (permission: string): boolean => {
    // 🚀 Developers skip all RBAC checks
    if (sessionRole === "Developer") {
      return true;
    }
    return effectivePermissions.includes(permission);
  };

  return (
    <RbacContext.Provider
      value={{
        role: effectiveRole,
        permissions: effectivePermissions,
        canAccess: canAccessFn,

        impersonatedRole,
        setImpersonatedRole,

        sessionRole,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
};