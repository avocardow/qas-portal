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

  // Seed Audit Stages with explicit IDs
  const auditStages = [
    { id: 1, name: 'Planning', description: 'Initial planning and risk assessment' },
    { id: 2, name: '1st Interim Review', description: 'First periodic review during the year' },
    { id: 3, name: '2nd Interim Review', description: 'Second periodic review during the year' },
    { id: 4, name: 'Year-End Audit', description: 'Final audit procedures for the year end' },
    { id: 5, name: 'Reporting', description: 'Preparation and finalization of the audit report' },
    { id: 6, name: 'Post-Audit', description: 'Follow-up and completion tasks' },
  ];
  for (const stage of auditStages) {
    await prisma.auditStage.upsert({
      where: { name: stage.name },
      update: { id: stage.id, description: stage.description },
      create: { id: stage.id, name: stage.name, description: stage.description },
    });
    console.log(`Seeded audit stage: ${stage.name}`);
  }

  // Seed Audit Statuses with explicit IDs
  const auditStatuses = [
    { id: 1, name: 'Not Started', description: 'Audit cycle initiated but work not commenced' },
    { id: 2, name: 'In Progress', description: 'Actively working on the current stage' },
    { id: 3, name: 'Awaiting Documents', description: 'Waiting for information/documents from the client' },
    { id: 4, name: 'Information Received', description: 'Documents received, ready for processing/review' },
    { id: 5, name: 'Queries Sent', description: 'Questions or requests for clarification sent to client' },
    { id: 6, name: 'In Review', description: 'Internal review of workpapers/findings' },
    { id: 7, name: 'Awaiting Payment', description: 'Waiting for invoice payment before proceeding/lodging' },
    { id: 8, name: 'Ready to Lodge', description: 'Audit complete, report finalized, ready for OFT submission' },
    { id: 9, name: 'Lodged with OFT', description: 'Audit report submitted to the Office of Fair Trading' },
    { id: 10, name: 'Completed', description: 'Audit cycle fully completed for the year' },
  ];
  for (const status of auditStatuses) {
    await prisma.auditStatus.upsert({
      where: { name: status.name },
      update: { description: status.description },
      create: { id: status.id, name: status.name, description: status.description },
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