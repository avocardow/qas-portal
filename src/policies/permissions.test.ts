import {
  permissionSchema,
  getPermissionsForRole,
  roleHasPermission,
  Role,
} from "@/policies/permissions";
import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
} from "@/constants/permissions";

describe("permissionSchema", () => {
  test("Developer has all permissions", () => {
    const permissions = permissionSchema.Developer;
    const expected = [
      ...Object.values(AUDIT_PERMISSIONS),
      ...Object.values(TASK_PERMISSIONS),
      ...Object.values(DOCUMENT_PERMISSIONS),
      ...Object.values(PHONE_PERMISSIONS),
    ];
    expect(permissions).toEqual(expect.arrayContaining(expected));
    expect(permissions).toHaveLength(expected.length);
  });

  test("Admin has all permissions", () => {
    const permissions = getPermissionsForRole("Admin");
    const expected = [
      ...Object.values(AUDIT_PERMISSIONS),
      ...Object.values(TASK_PERMISSIONS),
      ...Object.values(DOCUMENT_PERMISSIONS),
      ...Object.values(PHONE_PERMISSIONS),
    ];
    expect(permissions).toEqual(expect.arrayContaining(expected));
  });

  test("Client permissions are correct", () => {
    const permissions = getPermissionsForRole("Client");
    const expected = [
      DOCUMENT_PERMISSIONS.GET_BY_CLIENT_ID,
      DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID,
      DOCUMENT_PERMISSIONS.GET_BY_TASK_ID,
    ];
    expect(permissions).toEqual(expect.arrayContaining(expected));
    expect(permissions).toHaveLength(expected.length);
  });
});

describe("roleHasPermission", () => {
  test("Admin can CREATE audit", () => {
    expect(roleHasPermission("Admin", AUDIT_PERMISSIONS.CREATE)).toBe(true);
  });

  test("Client cannot CREATE task", () => {
    expect(roleHasPermission("Client", TASK_PERMISSIONS.CREATE)).toBe(false);
  });

  test("Staff can GET_ALL tasks", () => {
    expect(roleHasPermission("Staff", TASK_PERMISSIONS.GET_ALL)).toBe(true);
  });

  test("Unknown role returns empty permissions", () => {
    // @ts-ignore: testing unknown role fallback
    expect(getPermissionsForRole("UnknownRole" as Role)).toEqual([]);
  });
}); 