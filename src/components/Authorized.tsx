import React, { ReactNode } from 'react';
import { useAbility } from '@/hooks/useAbility';

import type { Permission } from '@/policies/permissions';

export type AuthorizedProps = {
  action: Permission | string;
  fallback?: ReactNode;
  children?: ReactNode;
};

// Authorized component integrates permission checks
export default function Authorized({ action, fallback = null, children }: AuthorizedProps) {
  const { can } = useAbility();
  const isAllowed = can(action);
  if (!isAllowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
} 