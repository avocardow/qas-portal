import React from "react";
import { useAbility } from "@/hooks/useAbility";

export type RequirePermissionProps = {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function RequirePermission({
  permission,
  fallback = <p>You are not authorized to access this content.</p>,
  children,
}: RequirePermissionProps) {
  const { can } = useAbility();
  const allowed = can(permission);
  if (!allowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
