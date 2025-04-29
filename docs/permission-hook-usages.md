# Permission Hook Usages Inventory

The project now uses the `useAbility` hook and `can(permission)` function for permission checks instead of the legacy `usePermission` hook.

```typescript
import { useAbility } from '@/hooks/useAbility';
const { can } = useAbility();

if (can('task.getAll')) {
  // Fetch and render tasks
}
```

Use the `<Authorized>` component for memoized UI gating:

```tsx
<Authorized action="task.getAll" fallback={<div>No access</div>}>
  <TasksList />
</Authorized>
```

Below is a list of all instances of `usePermission(...)` across the codebase, including file path, line number, and permission constant used.

- **src/layout/AppSidebar.tsx**
  - Line 40: `const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);`
  - Line 41: `const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);`
  - Line 42: `const canUsePhone = usePermission(PHONE_PERMISSIONS.MAKE_CALL);`

- **src/components/RequirePermission.tsx**
  - Line 15: `const allowed = usePermission(permission);`

- **src/components/audit/AuditList.tsx**
  - Line 21: `const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);`
  - Line 22: `const canCreateAudit = usePermission(AUDIT_PERMISSIONS.CREATE);`
  - Line 23: `const canUpdateStageStatus = usePermission(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS);`

- **src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx**
  - Line 13: `const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);`
  - Line 14: `const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);`

- **src/app/(pages)/(dashboard)/(app)/audits/page.tsx**
  - Line 8: `const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);`

- **src/app/(pages)/(dashboard)/(app)/phone/page.tsx**
  - Line 18: `const canMakeCall = usePermission(PHONE_PERMISSIONS.MAKE_CALL);`

- **src/app/(pages)/(dashboard)/(app)/tasks/[taskId]/page.tsx**
  - Line 14: `const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);`

- **src/app/(pages)/(dashboard)/(app)/tasks/new/page.tsx**
  - Line 29: `const canCreateTask = usePermission(TASK_PERMISSIONS.CREATE);`

- **src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx**
  - Line 28: `const canViewAudit = usePermission(AUDIT_PERMISSIONS.GET_BY_ID);`
  - Line 29: `const canAssignUser = usePermission(AUDIT_PERMISSIONS.ASSIGN_USER);`
  - Line 30: `const canUnassignUser = usePermission(AUDIT_PERMISSIONS.UNASSIGN_USER);`
  - Line 31: `const canCreateTask = usePermission(TASK_PERMISSIONS.CREATE);`
  - Line 32: `const canViewTasks = usePermission(TASK_PERMISSIONS.GET_BY_AUDIT_ID);`
  - Line 33: `const canUpdateTask = usePermission(TASK_PERMISSIONS.UPDATE);`
  - Line 34: `const canViewDocuments = usePermission(DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID);`
