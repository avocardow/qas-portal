import React from 'react';
import { useAbility } from '@/hooks/useAbility';

// Authorized component integrates permission checks
export default function Authorized({ action, fallback, children }: any) {
  const { can } = useAbility();
  const isAllowed = can(action);
  if (!isAllowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
} 