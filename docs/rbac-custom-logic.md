# Custom RBAC Logic

This document outlines the custom RBAC (Role-Based Access Control) logic implemented in the project, covering policy definitions, context hooks, permission checks, and component usage.

## 1. Permission Hook (`useAbility`)

Defined in [src/hooks/useAbility.ts](src/hooks/useAbility.ts):
```typescript
import { useAbility } from '@/hooks/useAbility';

export function useAbility(): { can: (permission: string) => boolean; cannot: (permission: string) => boolean };
```
- **Key Points**
  - `can(permission)`: Returns `boolean` indicating if the user has the specified permission.
  - `cannot(permission)`: Returns the opposite of `can(permission)`.

## 2. Authorized Component

Defined in [src/components/Authorized.tsx](src/components/Authorized.tsx):
```tsx
<Authorized action="task.update" fallback={<NoAccess />}> 
  <UserEditor />
</Authorized>
```
- **Key Points**
  - Wraps children in a permission guard using `useAbility().can(action)`.
  - `fallback`: Optional element rendered when access is denied (defaults to `null`).

## 3. CASL Integration (`useAbility`)

Defined in [src/hooks/useAbility.ts](src/hooks/useAbility.ts):
- Wraps CASL ability definitions to support dynamic permission checks.
- Example usage:
  ```typescript
  const { can } = useAbility();
  if (can('update:document')) { /* show edit UI */ }
  ```

## 4. Component-Level Gating

Many components accept a `permission` or use `Authorized`:
- In tables (e.g., `DataTableTwo`), columns with `permission`:
  ```tsx
  <Authorized action={permission}>
    <TableCell>{row[dataKey]}</TableCell>
  </Authorized>
  ```
- Action buttons (View/Edit) use `useRole()` and `onView`/`onEdit` handlers.

## 5. Best Practices

- Define new permissions in `rbacPolicy` before use.
- Use `useRbac().canAccess` or `useAbility().can` for inline checks.
- Prefer `<Authorized>` for wrapping entire UI fragments.
- Keep policy definitions DRY and grouped by feature.

## 6. Server-side Enforcement (permissionProcedure)

Defined in [src/server/api/utils/rbac.ts](src/server/api/utils/rbac.ts):
```typescript
import { TRPCError } from '@trpc/server';
import { rbacPolicy } from '@/utils/rbacPolicy';

export function hasPermission(role: Role | null, permission: string): boolean {
  // Check policy mapping for given role
  return !!role && (rbacPolicy[role] || []).includes(permission);
}

export const permissionProcedure = t.procedure
  .use(async ({ ctx, next, rawInput }) => {
    const { role } = ctx.session;
    const required = (rawInput as { permission: string }).permission;
    if (!hasPermission(role, required)) {
      // Log denied access with context
      ctx.logger.warn(`Permission denied`, { role, permission: required, userId: ctx.session.userId });
      throw new TRPCError({ code: 'FORBIDDEN', message: `Insufficient permissions: ${required}` });
    }
    return next();
  });
```
- **Key Points**
  - Enforces permissions on the server before executing resolver logic
  - Logs all denied access attempts for auditing
  - Throws `TRPCError` with `FORBIDDEN` status for unauthorized calls

## 7. Edge Cases & Special Conditions

- **Hardcoded Defaults**: Some flows default to `Client` when no session role is present; ensure session and impersonation states are handled explicitly.
- **Impersonation Flow**: `sessionRole` vs `role` in UI context (e.g., in [src/layout/AppHeader.tsx](src/layout/AppHeader.tsx)) must correctly reflect when a user is acting on behalf of another.
- **Custom Hooks Overrides**: Overriding `useRbac` in tests (e.g., via `vi.spyOn`) may bypass real permission logic; document testing patterns to avoid false positives.
- **Mixed RBAC & ABAC**: In some endpoints (e.g., document queries), access combines role-based checks with resource-based conditions; ensure logic in `hasPermission` and query filters align.

---
*Last updated on `$(date)`* 