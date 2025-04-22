"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { rbacPolicy, type Role } from "@/utils/rbacPolicy";

export type RbacContextType = {
  role: Role | null;
  permissions: string[];
  canAccess: (permission: string) => boolean;
};

const RbacContext = createContext<RbacContextType | undefined>(undefined);

export const useRbac = (): RbacContextType => {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error("useRbac must be used within a RbacProvider");
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
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const userRole = session.user.role as Role;
      setRole(userRole);
      setPermissions(rbacPolicy[userRole] || []);
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "[RBAC] role:",
          userRole,
          "permissions:",
          rbacPolicy[userRole]
        );
      }
    } else {
      setRole(null);
      setPermissions([]);
    }
  }, [session, status]);

  const canAccessFn = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return (
    <RbacContext.Provider
      value={{
        role,
        permissions,
        canAccess: canAccessFn,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
};
