# Custom RBAC Logic

This document outlines the custom RBAC (Role-Based Access Control) logic implemented in the project, covering policy definitions, context hooks, permission checks, and component usage.

## 1. Policy Mapping (`rbacPolicy`)

Defined in [src/utils/rbacPolicy.ts](src/utils/rbacPolicy.ts):
```typescript
export const rbacPolicy: Record<Role, string[]> = {
  Admin:   [/* all permissions */],
  Manager: [/* subset of permissions */],
  Client:  [/* client-level permissions */],
  // ... other roles
}
```
- **Key Points**
  - Maps each `Role` to an array of permission strings.
  - Used by `canAccess(permission, role)` utility for quick lookups.

## 2. Context Hook (`useRbac`)

Defined in [src/context/RbacContext.tsx](src/context/RbacContext.tsx):
```typescript
export const useRbac = () => {
  const { role, permissions, canAccess } = useContext(RbacContext);
  return { role, permissions, canAccess };
};
```
- **Key Points**
  - `role`: Current user role (e.g., `'Admin'`).
  - `permissions`: Derived from `rbacPolicy[role]`.
  - `canAccess(permission: string)`: Returns `boolean` based on policy.

## 3. CASL Integration (`useAbility`)

Defined in [src/hooks/useAbility.ts](src/hooks/useAbility.ts):
- Wraps CASL ability definitions to support dynamic permission checks.
- Example usage:
  ```typescript
  const { can } = useAbility();
  if (can('update:document')) { /* show edit UI */ }
  ```

## 4. Authorized Component

Defined in [src/components/Authorized.tsx](src/components/Authorized.tsx):
```tsx
<Authorized action="update:user" fallback={<NoAccess />}>
  <UserEditor />
</Authorized>
```
- **Key Points**
  - Wraps children in a permission guard.
  - `action`: Permission string to check via `useAbility().can(action)`.
  - `fallback`: Optional element rendered when access is denied (defaults to `null`).

## 5. Component-Level Gating

Many components accept a `permission` or use `Authorized`:
- In tables (e.g., `DataTableTwo`), columns with `permission`:
  ```tsx
  <Authorized action={permission}>
    <TableCell>{row[dataKey]}</TableCell>
  </Authorized>
  ```
- Action buttons (View/Edit) use `useRole()` and `onView`/`onEdit` handlers.

## 6. Best Practices

- Define new permissions in `rbacPolicy` before use.
- Use `useRbac().canAccess` or `useAbility().can` for inline checks.
- Prefer `<Authorized>` for wrapping entire UI fragments.
- Keep policy definitions DRY and grouped by feature.

---
*Generated on `$(date)` by automation script.* 