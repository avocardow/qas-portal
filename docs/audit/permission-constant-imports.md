src/app/(pages)/(dashboard)/(app)/tasks/new/page.tsx:13:import { TASK_PERMISSIONS } from "@/constants/permissions";
src/app/(pages)/(dashboard)/(app)/tasks/new/page.tsx:29:  const canCreateTask = usePermission(TASK_PERMISSIONS.CREATE);
src/app/(pages)/(dashboard)/(app)/tasks/[taskId]/page.tsx:10:import { TASK_PERMISSIONS } from "@/constants/permissions";
src/app/(pages)/(dashboard)/(app)/tasks/[taskId]/page.tsx:14:  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);
src/app/(pages)/(dashboard)/(app)/audits/page.tsx:4:import { AUDIT_PERMISSIONS } from "@/constants/permissions";
src/app/(pages)/(dashboard)/(app)/audits/page.tsx:8:  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:19:  AUDIT_PERMISSIONS,
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:20:  TASK_PERMISSIONS,
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:21:  DOCUMENT_PERMISSIONS,
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:28:  const canViewAudit = usePermission(AUDIT_PERMISSIONS.GET_BY_ID);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:29:  const canAssignUser = usePermission(AUDIT_PERMISSIONS.ASSIGN_USER);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:30:  const canUnassignUser = usePermission(AUDIT_PERMISSIONS.UNASSIGN_USER);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:31:  const canCreateTask = usePermission(TASK_PERMISSIONS.CREATE);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:32:  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_BY_AUDIT_ID);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:33:  const canUpdateTask = usePermission(TASK_PERMISSIONS.UPDATE);
src/app/(pages)/(dashboard)/(app)/audits/[auditId]/page.tsx:34:  const canViewDocuments = usePermission(DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID);
src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx:7:import { TASK_PERMISSIONS, AUDIT_PERMISSIONS } from "@/constants/permissions";
src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx:13:  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx:14:  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);
src/app/(pages)/(dashboard)/(app)/phone/page.tsx:14:import { PHONE_PERMISSIONS } from "@/constants/permissions";
src/app/(pages)/(dashboard)/(app)/phone/page.tsx:18:  const canMakeCall = usePermission(PHONE_PERMISSIONS.MAKE_CALL);
src/layout/AppSidebar.tsx:9:import { TASK_PERMISSIONS, PHONE_PERMISSIONS } from "@/constants/permissions";
src/layout/AppSidebar.tsx:10:import { AUDIT_PERMISSIONS } from "@/constants/permissions";
src/layout/AppSidebar.tsx:40:  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);
src/layout/AppSidebar.tsx:41:  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
src/layout/AppSidebar.tsx:42:  const canUsePhone = usePermission(PHONE_PERMISSIONS.MAKE_CALL);
src/constants/permissions.ts:2:export const AUDIT_PERMISSIONS = {
src/constants/permissions.ts:12:  (typeof AUDIT_PERMISSIONS)[keyof typeof AUDIT_PERMISSIONS];
src/constants/permissions.ts:14:export const TASK_PERMISSIONS = {
src/constants/permissions.ts:24:  (typeof TASK_PERMISSIONS)[keyof typeof TASK_PERMISSIONS];
src/constants/permissions.ts:27:export const DOCUMENT_PERMISSIONS = {
src/constants/permissions.ts:34:  (typeof DOCUMENT_PERMISSIONS)[keyof typeof DOCUMENT_PERMISSIONS];
src/constants/permissions.ts:36:export const PHONE_PERMISSIONS = {
src/constants/permissions.ts:42:  (typeof PHONE_PERMISSIONS)[keyof typeof PHONE_PERMISSIONS];
src/server/api/routers/document.ts:5:import { DOCUMENT_PERMISSIONS } from "@/constants/permissions";
src/server/api/routers/document.ts:22:  getByClientId: permissionProcedure(DOCUMENT_PERMISSIONS.GET_BY_CLIENT_ID)
src/server/api/routers/document.ts:48:  getByAuditId: permissionProcedure(DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID)
src/server/api/routers/document.ts:78:  getByTaskId: permissionProcedure(DOCUMENT_PERMISSIONS.GET_BY_TASK_ID)
src/server/api/routers/audit.ts:7:import { AUDIT_PERMISSIONS } from "@/constants/permissions";
src/server/api/routers/audit.ts:40:    .use(enforcePermission(AUDIT_PERMISSIONS.CREATE))
src/server/api/routers/audit.ts:63:    .use(enforcePermission(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS))
src/server/api/routers/audit.ts:87:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
src/server/api/routers/audit.ts:109:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_ID))
src/server/api/routers/audit.ts:141:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
src/server/api/routers/audit.ts:151:    .use(enforcePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID))
src/server/api/routers/audit.ts:160:    .use(enforcePermission(AUDIT_PERMISSIONS.ASSIGN_USER))
src/server/api/routers/audit.ts:186:    .use(enforcePermission(AUDIT_PERMISSIONS.UNASSIGN_USER))
src/server/api/routers/task.ts:4:import { TASK_PERMISSIONS } from "@/constants/permissions";
src/server/api/routers/task.ts:43:  getByAuditId: permissionProcedure(TASK_PERMISSIONS.GET_BY_AUDIT_ID)
src/server/api/routers/task.ts:52:  getAssignedToMe: permissionProcedure(TASK_PERMISSIONS.GET_ASSIGNED_TO_ME)
src/server/api/routers/task.ts:73:  getAll: permissionProcedure(TASK_PERMISSIONS.GET_ALL)
src/server/api/routers/task.ts:97:  create: permissionProcedure(TASK_PERMISSIONS.CREATE)
src/server/api/routers/task.ts:114:  update: permissionProcedure(TASK_PERMISSIONS.UPDATE)
src/server/api/routers/task.ts:125:  delete: permissionProcedure(TASK_PERMISSIONS.DELETE)
src/server/api/routers/task.ts:134:  getById: permissionProcedure(TASK_PERMISSIONS.GET_ALL)
src/server/api/routers/phone.ts:2:import { PHONE_PERMISSIONS } from "@/constants/permissions";
src/server/api/routers/phone.ts:9:  makePstnCall: permissionProcedure(PHONE_PERMISSIONS.MAKE_CALL)
src/server/api/routers/phone.ts:43:  logCall: permissionProcedure(PHONE_PERMISSIONS.LOG_CALL)
src/server/api/utils/rbac.test.ts:11:import { TASK_PERMISSIONS } from "@/constants/permissions";
src/server/api/utils/rbac.test.ts:24:    expect(checkRolePermission("Admin", TASK_PERMISSIONS.GET_ALL)).toBe(true);
src/server/api/utils/rbac.test.ts:28:    expect(checkRolePermission("Client", TASK_PERMISSIONS.GET_ALL)).toBe(false);
src/server/api/utils/rbac.test.ts:32:    expect(checkRolePermission("UnknownRole", TASK_PERMISSIONS.GET_ALL)).toBe(
src/server/api/utils/rbac.test.ts:135:    expect(hasPermission(ctxAdmin, TASK_PERMISSIONS.GET_ALL)).toBe(true);
src/server/api/utils/rbac.test.ts:139:    expect(hasPermission(ctxClient, TASK_PERMISSIONS.GET_ALL)).toBe(false);
src/server/api/utils/rbac.test.ts:143:    expect(hasPermission({}, TASK_PERMISSIONS.CREATE)).toBe(false);
src/server/api/utils/rbac.test.ts:144:    expect(hasPermission({ session: {} }, TASK_PERMISSIONS.CREATE)).toBe(false);
src/server/api/utils/rbac.test.ts:146:      hasPermission({ session: { user: {} } }, TASK_PERMISSIONS.CREATE)
src/utils/rbacPolicy.test.ts:3:  AUDIT_PERMISSIONS,
src/utils/rbacPolicy.test.ts:4:  TASK_PERMISSIONS,
src/utils/rbacPolicy.test.ts:5:  DOCUMENT_PERMISSIONS,
src/utils/rbacPolicy.test.ts:6:  PHONE_PERMISSIONS,
src/utils/rbacPolicy.test.ts:12:      ...Object.values(AUDIT_PERMISSIONS),
src/utils/rbacPolicy.test.ts:13:      ...Object.values(TASK_PERMISSIONS),
src/utils/rbacPolicy.test.ts:14:      ...Object.values(DOCUMENT_PERMISSIONS),
src/utils/rbacPolicy.test.ts:15:      ...Object.values(PHONE_PERMISSIONS),
src/utils/rbacPolicy.test.ts:22:      ...Object.values(AUDIT_PERMISSIONS),
src/utils/rbacPolicy.test.ts:23:      ...Object.values(TASK_PERMISSIONS),
src/utils/rbacPolicy.test.ts:29:    const { GET_BY_CLIENT_ID, GET_BY_ID } = AUDIT_PERMISSIONS;
src/utils/rbacPolicy.test.ts:36:    const { GET_BY_AUDIT_ID, GET_ASSIGNED_TO_ME, GET_ALL } = TASK_PERMISSIONS;
src/utils/rbacPolicy.test.ts:44:      DOCUMENT_PERMISSIONS;
src/utils/rbacPolicy.ts:2:  AUDIT_PERMISSIONS,
src/utils/rbacPolicy.ts:3:  TASK_PERMISSIONS,
src/utils/rbacPolicy.ts:4:  DOCUMENT_PERMISSIONS,
src/utils/rbacPolicy.ts:5:  PHONE_PERMISSIONS,
src/utils/rbacPolicy.ts:11:  AUDIT_PERMISSIONS;
src/utils/rbacPolicy.ts:16:} = TASK_PERMISSIONS;
src/utils/rbacPolicy.ts:21:} = DOCUMENT_PERMISSIONS;
src/utils/rbacPolicy.ts:25:    ...Object.values(AUDIT_PERMISSIONS),
src/utils/rbacPolicy.ts:26:    ...Object.values(TASK_PERMISSIONS),
src/utils/rbacPolicy.ts:27:    ...Object.values(DOCUMENT_PERMISSIONS),
src/utils/rbacPolicy.ts:28:    ...Object.values(PHONE_PERMISSIONS),
src/utils/rbacPolicy.ts:31:    ...Object.values(AUDIT_PERMISSIONS),
src/utils/rbacPolicy.ts:32:    ...Object.values(TASK_PERMISSIONS),
src/utils/rbacPolicy.ts:38:    ...Object.values(AUDIT_PERMISSIONS),
src/utils/rbacPolicy.ts:39:    ...Object.values(TASK_PERMISSIONS),
src/utils/rbacPolicy.ts:40:    ...Object.values(DOCUMENT_PERMISSIONS),
src/utils/rbacPolicy.ts:41:    ...Object.values(PHONE_PERMISSIONS),
src/components/audit/AuditList.tsx:14:import { AUDIT_PERMISSIONS } from "@/constants/permissions";
src/components/audit/AuditList.tsx:22:  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
src/components/audit/AuditList.tsx:23:  const canCreateAudit = usePermission(AUDIT_PERMISSIONS.CREATE);
src/components/audit/AuditList.tsx:25:    AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS
