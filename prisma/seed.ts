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
    { id: 0, name: 'Onboarding', description: 'Initial setup and preparation tasks before the audit starts' },
    { id: 1, name: '1st Interim Review', description: 'First periodic review during the year' },
    { id: 2, name: '2nd Interim Review', description: 'Second periodic review during the year' },
    { id: 3, name: 'Year-End Audit', description: 'Final audit procedures for the year end' },
    { id: 4, name: 'Completed', description: 'Audit cycle fully completed for the year' },
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
    { id: 0, name: 'Awaiting Appointment', description: 'Audit scheduled but awaiting initial engagement meeting' },
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

  // Seed initial application users
  const now = new Date();
  const initialUsers = [
    { id: '521d8e57-7a65-4f3c-9b12-8d3e4f6a7b1c', name: 'Rowan Cardow', email: 'rowan.cardow@qaspecialists.com.au', roleId: 0, isActive: true },
    { id: '6f2b3c4d-5e6f-4a7b-8c9d-0a1b2c3d4e5f', name: 'Daren Cardow', email: 'daren.cardow@qaspecialists.com.au', roleId: 1, isActive: true },
    { id: '0a1b2c3d-4e5f-4a6b-8c9d-1e2f3a4b5c6d', name: 'Anita Cardow', email: 'anita.cardow@qaspecialists.com.au', roleId: 2, isActive: true },
    { id: '7e8f9a0b-1c2d-4e3f-5a6b-7c8d9e0f1a2b', name: 'Kaitlyn Pobar', email: 'kaitlyn.pobar@qaspecialists.com.au', roleId: 3, isActive: true },
  ];
  for (const user of initialUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: now,
        updatedAt: now,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: null,
        image: null,
        roleId: user.roleId,
        m365ObjectId: null,
        isActive: user.isActive,
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log(`Seeded user: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });