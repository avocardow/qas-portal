import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const roles: Array<{ name: string; id?: number }> = [
    { name: "Developer", id: 0 },
    { name: "Admin", id: 1 },
    { name: "Manager", id: 2 },
    { name: "Auditor", id: 3 },
    { name: "Staff", id: 4 },
    { name: "Client", id: 5 },
  ];
  for (const role of roles) {
    const createData = role.id !== undefined ? { id: role.id, name: role.name } : { name: role.name };
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: createData });
    console.log(`Seeded role: ${role.name}`);
  }
  console.log("Seeded all roles successfully");

  // Permissions seeding removed per new useAbility system
}

main()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });