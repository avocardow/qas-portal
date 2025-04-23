import { rbacPolicy } from "./rbacPolicy";
import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
} from "@/constants/permissions";

describe("RBAC Policy", () => {
  it("Admin should have all permissions", () => {
    const allPermissions = [
      ...Object.values(AUDIT_PERMISSIONS),
      ...Object.values(TASK_PERMISSIONS),
      ...Object.values(DOCUMENT_PERMISSIONS),
      ...Object.values(PHONE_PERMISSIONS),
    ];
    expect(rbacPolicy.Admin.sort()).toEqual(allPermissions.sort());
  });

  it("Manager should have audit and task permissions", () => {
    const expected = [
      ...Object.values(AUDIT_PERMISSIONS),
      ...Object.values(TASK_PERMISSIONS),
    ];
    expect(rbacPolicy.Manager.sort()).toEqual(expected.sort());
  });

  it("Auditor should have read-only audit permissions", () => {
    const { GET_BY_CLIENT_ID, GET_BY_ID } = AUDIT_PERMISSIONS;
    expect(rbacPolicy.Auditor.sort()).toEqual(
      [GET_BY_CLIENT_ID, GET_BY_ID].sort()
    );
  });

  it("Staff should have task view permissions", () => {
    const { GET_BY_AUDIT_ID, GET_ASSIGNED_TO_ME, GET_ALL } = TASK_PERMISSIONS;
    expect(rbacPolicy.Staff.sort()).toEqual(
      [GET_BY_AUDIT_ID, GET_ASSIGNED_TO_ME, GET_ALL].sort()
    );
  });

  it("Client should have only document read permissions", () => {
    const { GET_BY_CLIENT_ID, GET_BY_AUDIT_ID, GET_BY_TASK_ID } =
      DOCUMENT_PERMISSIONS;
    expect(rbacPolicy.Client.sort()).toEqual(
      [GET_BY_CLIENT_ID, GET_BY_AUDIT_ID, GET_BY_TASK_ID].sort()
    );
  });
});
