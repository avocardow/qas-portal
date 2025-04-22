import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
} from "@/constants/permissions";

export type Role = "Admin" | "Manager" | "Auditor" | "Staff" | "Client";

const { GET_BY_CLIENT_ID: AUDIT_GET_BY_CLIENT_ID, GET_BY_ID: AUDIT_GET_BY_ID } =
  AUDIT_PERMISSIONS;
const {
  GET_BY_AUDIT_ID: TASK_GET_BY_AUDIT_ID,
  GET_ASSIGNED_TO_ME: TASK_GET_ASSIGNED_TO_ME,
  GET_ALL: TASK_GET_ALL,
} = TASK_PERMISSIONS;
const {
  GET_BY_CLIENT_ID: DOC_GET_BY_CLIENT_ID,
  GET_BY_AUDIT_ID: DOC_GET_BY_AUDIT_ID,
  GET_BY_TASK_ID: DOC_GET_BY_TASK_ID,
} = DOCUMENT_PERMISSIONS;

export const rbacPolicy: Record<Role, string[]> = {
  Admin: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
    ...Object.values(DOCUMENT_PERMISSIONS),
  ],
  Manager: [
    ...Object.values(AUDIT_PERMISSIONS),
    ...Object.values(TASK_PERMISSIONS),
  ],
  Auditor: [AUDIT_GET_BY_CLIENT_ID, AUDIT_GET_BY_ID],
  Staff: [TASK_GET_BY_AUDIT_ID, TASK_GET_ASSIGNED_TO_ME, TASK_GET_ALL],
  Client: [DOC_GET_BY_CLIENT_ID, DOC_GET_BY_AUDIT_ID, DOC_GET_BY_TASK_ID],
};
