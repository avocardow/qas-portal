# Consolidated Permission Audit Inventory

Below is a table of all documented permission usages across the codebase, aggregated by type.

| File Path | Line Number | Permission Type | Permission Value |
|-----------|-------------|-----------------|------------------|
| src/layout/AppSidebar.tsx | 40  | Hook           | TASK_PERMISSIONS.GET_ALL           |
| src/layout/AppSidebar.tsx | 41  | Hook           | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/layout/AppSidebar.tsx | 42  | Hook           | PHONE_PERMISSIONS.MAKE_CALL        |
| src/components/RequirePermission.tsx | 14  | Component      | permission                        |
| src/components/audit/AuditList.tsx    | 21  | Hook           | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/components/audit/AuditList.tsx    | 22  | Hook           | AUDIT_PERMISSIONS.CREATE           |
| src/components/audit/AuditList.tsx    | 23  | Hook           | AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS |
| src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx | 13  | Hook           | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx | 14  | Hook           | TASK_PERMISSIONS.GET_ALL           |
| src/app/(pages)/(dashboard)/(app)/audits/page.tsx    | 8   | Hook           | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/app/(pages)/(dashboard)/(app)/phone/page.tsx     | 18  | Hook           | PHONE_PERMISSIONS.MAKE_CALL        |
| src/app/(pages)/(dashboard)/(app)/tasks/[taskId]/page.tsx | 14  | Hook    | TASK_PERMISSIONS.GET_ALL           |
| src/app/(pages)/(dashboard)/(app)/tasks/new/page.tsx | 29  | Hook           | TASK_PERMISSIONS.CREATE            |
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 28  | Hook    | AUDIT_PERMISSIONS.GET_BY_ID     |
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 29  | Hook    | AUDIT_PERMISSIONS.ASSIGN_USER   |
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 30  | Hook    | AUDIT_PERMISSIONS.UNASSIGN_USER |
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 31  | Hook    | TASK_PERMISSIONS.CREATE         |
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 32  | Hook    | TASK_PERMISSIONS.GET_BY_AUDIT_ID|
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 33  | Hook    | TASK_PERMISSIONS.UPDATE         |
| src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx | 34  | Hook    | DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID |
| src/server/api/routers/audit.ts       | 40  | Middleware     | AUDIT_PERMISSIONS.CREATE           |
| src/server/api/routers/audit.ts       | 63  | Middleware     | AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS |
| src/server/api/routers/audit.ts       | 87  | Middleware     | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/server/api/routers/audit.ts       | 109 | Middleware     | AUDIT_PERMISSIONS.GET_BY_ID        |
| src/server/api/routers/audit.ts       | 141 | Middleware     | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/server/api/routers/audit.ts       | 151 | Middleware     | AUDIT_PERMISSIONS.GET_BY_CLIENT_ID |
| src/server/api/routers/audit.ts       | 160 | Middleware     | AUDIT_PERMISSIONS.ASSIGN_USER      |
| src/server/api/routers/audit.ts       | 186 | Middleware     | AUDIT_PERMISSIONS.UNASSIGN_USER    |
| src/server/api/trpc.ts                | 189 | Middleware     | permission                         |
| src/layout/AppSidebar.tsx             | 9   | Constant Import| TASK_PERMISSIONS, PHONE_PERMISSIONS|
| src/layout/AppSidebar.tsx             | 10  | Constant Import| AUDIT_PERMISSIONS                  |
| src/app/(pages)/(dashboard)/(app)/tasks/new/page.tsx | 13  | Constant Import| TASK_PERMISSIONS           |
| src/app/(pages)/(dashboard)/(app)/tasks/[taskId]/page.tsx | 10  | Constant Import| TASK_PERMISSIONS         |
| src/app/(pages)/(dashboard)/(app)/audits/page.tsx    | 4   | Constant Import| AUDIT_PERMISSIONS              |
| src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx | 7   | Constant Import| TASK_PERMISSIONS, AUDIT_PERMISSIONS|
| src/app/(pages)/(dashboard)/(app)/phone/page.tsx     | 14  | Constant Import| PHONE_PERMISSIONS               |
| src/server/api/routers/document.ts    | 5   | Constant Import| DOCUMENT_PERMISSIONS            |
| src/server/api/routers/audit.ts       | 7   | Constant Import| AUDIT_PERMISSIONS              |
| src/server/api/routers/task.ts        | 4   | Constant Import| TASK_PERMISSIONS               |
| src/server/api/routers/phone.ts       | 2   | Constant Import| PHONE_PERMISSIONS             |
| src/server/api/utils/rbac.test.ts     | 11  | Constant Import| TASK_PERMISSIONS               |
| src/components/audit/AuditList.tsx    | 14  | Constant Import| AUDIT_PERMISSIONS              | 