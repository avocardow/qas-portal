import React, { ReactNode, useMemo } from 'react';
import { useAbility } from '@/hooks/useAbility';

import type { Permission } from '@/policies/permissions';

export type AuthorizedProps = {
  action: Permission | string;
  /** Optional subject to check permissions against */
  subject?: unknown;
  fallback?: ReactNode;
  children?: ReactNode;
};

/**
 * Usage Example:
 *
 * <Authorized action="read:document" fallback={<div>No access</div>}>
 *   <DocumentContent />
 * </Authorized>
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Authorized: React.FC<AuthorizedProps> = React.memo(function Authorized({ action, subject: _subject, fallback = null, children }: AuthorizedProps) {
  const { can } = useAbility();
  const isAllowed = useMemo(() => can(action), [can, action]);
  if (!isAllowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
});

export default Authorized; 