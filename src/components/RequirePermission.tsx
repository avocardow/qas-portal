import React from "react";
import { usePermission } from "@/context/RbacContext";

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
  const allowed = usePermission(permission);
  if (!allowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
