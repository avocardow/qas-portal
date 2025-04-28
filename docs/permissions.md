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
import { usePermission } from '@/context/RbacContext';

const canEdit = usePermission('task.update');
return <button disabled={!canEdit}>Edit Task</button>;
```

## Updating Permissions

1. Add new permission constant in `src/constants/permissions.ts`.
2. Update `permissionSchema` in `src/policies/permissions.ts` for relevant roles.
3. Add or update tests in `src/policies/permissions.test.ts`.
4. Update `docs/permissions.md` as needed.

--- 