# Permissions Documentation

This document provides an overview of the RBAC system, permission schema, and usage patterns.

## Roles

The system defines the following roles:

- `Developer` (full access to all permissions)
- `Admin` (access to audit, task, document, and phone permissions)
- `Manager` (access to audit and task permissions)
- `Auditor` (view-only access to audit endpoints)
- `Staff` (task view and assignment permissions)
- `Client` (document view permissions)

## Permission Schema

The central schema is defined in [permissions.ts](../src/policies/permissions.ts).

```typescript
export const permissionSchema: Record<Role, Permission[]> = {
  Developer: [ /* all permissions */ ],
  Admin: [...],
  Manager: [...],
  Auditor: [...],
  Staff: [...],
  Client: [...],
};
```

## Cheat Sheet

| Role      | Permissions Examples                              |
|-----------|---------------------------------------------------|
| Developer | all permissions                                   |
| Admin     | `audit.create`, `task.update`, `document.getByClientId` |
| Manager   | `audit.getByClientId`, `task.getAll`              |
| Auditor   | `audit.getByClientId`, `audit.getById`            |
| Staff     | `task.getAll`, `task.getAssignedToMe`             |
| Client    | `document.getByClientId`, `document.getByTaskId`  |

## Utility Functions

Utilities are provided in `src/utils/permissionUtils.ts`:

- `hasPermission(role, permission)`: Checks if a role has a permission (with Developer bypass).
- `canAccessPermission(role, permission)`: Server-side check via rbacPolicy.
- `listPermissions(role)`: Lists all permissions for a role.

### Example Usage

#### In API Route

```typescript
import { hasPermission } from '@/utils/permissionUtils';

if (!hasPermission(userRole, "task.create")) {
  throw new Error("Unauthorized");
}
```

#### In React Component

```tsx
import { useAbility } from '@/hooks/useAbility';

const { can } = useAbility();
const canEdit = can('task.update');
return <button disabled={!canEdit}>Edit Task</button>;
```

## Updating Permissions

1. Add new permission constant in `src/constants/permissions.ts`.
2. Update `permissionSchema` in `src/policies/permissions.ts` for relevant roles.
3. Add or update tests in `src/policies/permissions.test.ts`.
4. Update `docs/permissions.md` as needed.

## Permission Validation Workflow

To ensure our code permissions stay in sync with the database, follow this workflow:

### 1. Running the Validation Script Locally

Developers can verify permissions before pushing changes:

```bash
# Install dependencies (if not already done)
pnpm install

# Run the validation script
pnpm run validate:permissions
```

The script will output:
- **Missing Permissions**: Actions defined in code but not found in the database (build will exit with error code `1`).
- **Unused Permissions**: Actions in the database not referenced by any code (warning only).

### 2. Adding a New Permission

When introducing a new permission action:

1. **Define the constant** in [`src/constants/permissions.ts`](mdc:src/constants/permissions.ts).
2. **Update the permission schema** in [`src/policies/permissions.ts`](mdc:src/policies/permissions.ts) to assign it to the appropriate roles.
3. **Write or update tests** in `src/policies/permissions.test.ts` to cover the new action.
4. **Run the validation script** locally (`pnpm run validate:permissions`) to catch any missing permissions errors.
5. **Push your changes** and ensure CI passes; the build will fail if permissions are missing from the database.

### 3. CI Integration

The GitHub Actions pipeline includes a step to validate permissions:

```yaml
- name: Validate Permissions
  run: pnpm run validate:permissions
```

If the script detects missing permissions, the CI job will fail and prevent merging until the discrepancy is resolved.

## React Hooks Usage

Replace legacy `useRbac` and `usePermission` hooks with `useAbility`:
```typescript
import { useAbility } from '@/hooks/useAbility';

export default function MyComponent() {
  const { can, cannot } = useAbility();
  // Developer bypass: users with Developer role always pass
  if (!can('task.create')) {
    return <div>You don't have permission</div>;
  }
  return <button>Create Task</button>;
}
```

## Authorized Component Usage

Use the `<Authorized>` wrapper for declarative UI gating:
```tsx
import Authorized from '@/components/Authorized';

function TaskButton() {
  return (
    <Authorized action="task.update" fallback={<span>Access Denied</span>}>
      <button>Edit Task</button>
    </Authorized>
  );
}
```

- The `fallback` prop is optional (defaults to `null`).
- Supports arrays of permission strings: `<Authorized action={['permA', 'permB']}>`.

## Developer Bypass Behavior

The `useAbility` hook automatically allows **Developer** role users to bypass all permission checks:
```typescript
const { can } = useAbility();
// can('any.permission.name') === true if role includes Developer
```

## Quick Reference Updates

- **Deprecated**: `useRbac`, `usePermission` hooks and direct permission checks in components.
- **Preferred**: `useAbility` hook and `<Authorized>` component for consistent usage.

*End of permission updates for React usage.*

---

*Last updated: $(date "+%Y-%m-%d %H:%M:%S")* 