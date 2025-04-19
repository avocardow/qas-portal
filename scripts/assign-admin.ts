#!/usr/bin/env ts-node

import { db } from "@/server/db";
import readline from "readline";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: pnpm exec ts-node scripts/assign-admin.ts <USER_ID>");
    process.exit(1);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    console.error(`User with id ${userId} not found.`);
    process.exit(1);
  }

  console.log(`User: ${user.email}, current role: ${user.role.name}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "Are you sure you want to assign Admin role to this user? (yes/NO): ",
    async (answer) => {
      rl.close();
      if (answer.toLowerCase() !== "yes") {
        console.log("Aborting without changes.");
        process.exit(0);
      }

      // Fetch the Admin role record
      const adminRole = await db.role.findUnique({ where: { name: "Admin" } });
      if (!adminRole) {
        console.error("Admin role not found in database.");
        process.exit(1);
      }
      try {
        const updated = await db.user.update({
          where: { id: userId },
          data: { roleId: adminRole.id },
          include: { role: true },
        });
        console.log(
          `Assigned Admin role to: ${updated.email}, new role: ${updated.role.name}`
        );
      } catch (error) {
        console.error("Error updating role:", error);
        process.exit(1);
      }
    }
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
