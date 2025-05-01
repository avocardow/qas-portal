import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const roles: Array<{ name: string; id?: number; description: string }> = [
    { name: "Developer", id: 0, description: "Internal developer with unrestricted access and bypass privileges" },
    { name: "Admin", id: 1, description: "Full system access and user management" },
    { name: "Manager", id: 2, description: "Oversees audits and team members" },
    { name: "Auditor", id: 3, description: "Performs audits and manages assigned tasks" },
    { name: "Staff", id: 4, description: "Assists with specific audit tasks" },
    { name: "Client", id: 5, description: "External client user with portal access" },
  ];
  for (const role of roles) {
    const createData = role.id !== undefined
      ? { id: role.id, name: role.name, description: role.description }
      : { name: role.name, description: role.description };
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: createData });
    console.log(`Seeded role: ${role.name}`);
  }
  console.log("Seeded all roles successfully");

  // Seed Audit Stages
  const auditStages = [
    { name: 'Planning', displayOrder: 1, description: 'Initial planning and risk assessment' },
    { name: '1st Interim Review', displayOrder: 2, description: 'First periodic review during the year' },
    { name: '2nd Interim Review', displayOrder: 3, description: 'Second periodic review during the year' },
    { name: 'Year-End Audit', displayOrder: 4, description: 'Final audit procedures for the year end' },
    { name: 'Reporting', displayOrder: 5, description: 'Preparation and finalization of the audit report' },
    { name: 'Post-Audit', displayOrder: 6, description: 'Follow-up and completion tasks' },
  ];
  for (const stage of auditStages) {
    await prisma.auditStage.upsert({
      where: { name: stage.name },
      update: { displayOrder: stage.displayOrder, description: stage.description },
      create: stage,
    });
    console.log(`Seeded audit stage: ${stage.name}`);
  }

  // Seed Audit Statuses
  const auditStatuses = [
    { name: 'Not Started', description: 'Audit cycle initiated but work not commenced' },
    { name: 'In Progress', description: 'Actively working on the current stage' },
    { name: 'Awaiting Documents', description: 'Waiting for information/documents from the client' },
    { name: 'Information Received', description: 'Documents received, ready for processing/review' },
    { name: 'Queries Sent', description: 'Questions or requests for clarification sent to client' },
    { name: 'In Review', description: 'Internal review of workpapers/findings' },
    { name: 'Awaiting Payment', description: 'Waiting for invoice payment before proceeding/lodging' },
    { name: 'Ready to Lodge', description: 'Audit complete, report finalized, ready for OFT submission' },
    { name: 'Lodged with OFT', description: 'Audit report submitted to the Office of Fair Trading' },
    { name: 'Completed', description: 'Audit cycle fully completed for the year' },
  ];
  for (const status of auditStatuses) {
    await prisma.auditStatus.upsert({
      where: { name: status.name },
      update: { description: status.description },
      create: status,
    });
    console.log(`Seeded audit status: ${status.name}`);
  }

  console.log("Seeded all audit stages and statuses successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });