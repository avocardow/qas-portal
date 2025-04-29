"use client";

import React from "react";

// Legacy RBAC context has been removed. UseAbility hook replaces this functionality.
// Stub implementations are provided for compatibility and will throw if invoked directly.
export function useRbac(): never {
  throw new Error("useRbac is deprecated. Use useAbility instead.");
}

export function usePermissions(): never {
  throw new Error("usePermissions is deprecated. Use useAbility instead.");
}

export function useRole(): never {
  throw new Error("useRole is deprecated. Use useAbility instead.");
}

export const RbacProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // No-op provider; permission logic now handled by PermissionProvider/useAbility
  return <>{children}</>;
}; 