import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { AUDIT_PERMISSIONS } from "../src/constants/permissions";

const prisma = new PrismaClient();

async function main() {
  const roles = ["Admin", "Manager", "Auditor", "Staff", "Client"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Seeded role: ${name}`);
  }
  console.log("Seeded all roles successfully");

  // Seed audit permissions
  const auditPermissions = Object.values(AUDIT_PERMISSIONS).map((action) => ({
    action,
  }));
  await prisma.permission.createMany({
    data: auditPermissions,
    skipDuplicates: true,
  });
  console.log("Seeded audit permissions successfully");

  // Assign permissions to roles
  const [adminRole, managerRole, auditorRole] = await Promise.all([
    prisma.role.findUnique({ where: { name: "Admin" } }),
    prisma.role.findUnique({ where: { name: "Manager" } }),
    prisma.role.findUnique({ where: { name: "Auditor" } }),
  ]);

  const allPermissions = await prisma.permission.findMany({
    where: { action: { in: auditPermissions.map((p) => p.action) } },
  });
  const auditorActions: string[] = [
    AUDIT_PERMISSIONS.GET_BY_CLIENT_ID,
    AUDIT_PERMISSIONS.GET_BY_ID,
  ];
  const auditorPermissions = allPermissions.filter((p) =>
    auditorActions.includes(p.action)
  );

  // Create role-permission mappings
  const rolePermissionData = [
    // Admin gets all permissions
    ...allPermissions.map((p) => ({
      roleId: adminRole!.id,
      permissionId: p.id,
    })),
    // Manager gets all audit permissions
    ...allPermissions.map((p) => ({
      roleId: managerRole!.id,
      permissionId: p.id,
    })),
    // Auditor only gets read permissions
    ...auditorPermissions.map((p) => ({
      roleId: auditorRole!.id,
      permissionId: p.id,
    })),
  ];
  await prisma.rolePermission.createMany({
    data: rolePermissionData,
    skipDuplicates: true,
  });
  console.log("Assigned audit permissions to roles successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
