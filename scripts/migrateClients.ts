import { PrismaClient, Prisma } from "@prisma/client";
import { parse } from "csv-parse";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Calculate __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma Client
const prisma = new PrismaClient();

// --- Configuration ---
const csvFilePath = path.resolve(__dirname, "../data/clients.csv"); // This line should now work
// !!!!! REPLACE 'YOUR_ADMIN_USER_ID' with the actual UUID of the user running the script !!!!!
const scriptRunnerUserId = "283ac3ae-7c54-405b-b9f8-f0fd2e39027e"; // <<<--- CONFIRM/CHANGE THIS
const defaultAuditStatusName = "In Progress"; // Default status for initial audit

// --- Helper Functions ---

function monthToNumber(monthStr: string | undefined | null): number | null {
  if (!monthStr) return null;
  const lowerMonth = monthStr.trim().toLowerCase();
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const index = months.indexOf(lowerMonth);
  return index !== -1 ? index + 1 : null;
}

function parseCsvDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr?.trim()) return null;
  dateStr = dateStr.trim();
  const formats = [
    "dd/MM/yyyy",
    "MM/dd/yy",
    "M/d/yy",
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "M/d/yyyy",
  ];
  for (const format of formats) {
    try {
      let parts;
      let year: number | undefined,
        month: number | undefined,
        day: number | undefined;
      if (format === "dd/MM/yyyy")
        parts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      else if (format === "MM/dd/yy")
        parts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
      else if (format === "M/d/yy")
        parts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
      else if (format === "yyyy-MM-dd")
        parts = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      else if (format === "MM/dd/yyyy")
        parts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      else if (format === "M/d/yyyy")
        parts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

      if (!parts) continue;

      if (format === "dd/MM/yyyy") [, day, month, year] = parts.map(Number);
      else if (format === "MM/dd/yy" || format === "M/d/yy") {
        [, month, day, year] = parts.map(Number);
        if (year !== undefined && year < 100) year += 2000;
      } else if (format === "yyyy-MM-dd")
        [, year, month, day] = parts.map(Number);
      else if (format === "MM/dd/yyyy" || format === "M/d/yyyy")
        [, month, day, year] = parts.map(Number);

      if (
        year &&
        month &&
        day &&
        !isNaN(year) &&
        !isNaN(month) &&
        !isNaN(day)
      ) {
        if (day <= 0 || month <= 0 || month > 12) continue;
        const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day > daysInMonth[month - 1]!) continue;
        const date = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(date.getTime())) {
          if (date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
            return date;
          }
        }
      }
    } catch {
      /* ignore parse error */
    }
  }
  console.warn(`Could not parse date: "${dateStr}"`);
  return null;
}

function parseActivityLog(
  logText: string | undefined | null
): { date: Date | null; content: string }[] {
  if (!logText?.trim()) return [];
  logText = logText.trim();
  const entries: { date: Date | null; content: string }[] = [];
  const potentialEntries = logText.split(
    /; |(?='?\b(?:[0-2]?\d|3[01])\/(?:0?\d|1[0-2])\/\d{2,4}\b)/g
  );
  potentialEntries.forEach((entry) => {
    entry = entry.trim();
    if (!entry) return;
    const dateMatch = entry.match(
      /^'?\b((?:[0-2]?\d|3[01])\/(?:0?\d|1[0-2])\/\d{2,4})\b\s*-?\s*/
    );
    let date: Date | null = null;
    let content = entry;
    if (dateMatch?.[1]) {
      date = parseCsvDate(dateMatch[1]);
      if (date) {
        content = entry.substring(dateMatch[0].length).trim();
      }
    }
    if (content) entries.push({ date, content });
  });
  if (entries.length === 0 && logText)
    entries.push({ date: null, content: logText });
  return entries;
}

// --- Main Migration Function ---
async function main() {
  console.log(`Starting migration from ${csvFilePath}...`);
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    escape: "\\",
    relax_quotes: true,
  });
  let successCount = 0;
  let errorCount = 0;

  const auditStagesMap = new Map<string, number>();
  const auditStages = await prisma.auditStage.findMany({
    select: { id: true, name: true },
  });
  auditStages.forEach((stage) =>
    auditStagesMap.set(stage.name.toLowerCase(), stage.id)
  );

  const auditStatusesMap = new Map<string, number>();
  const auditStatuses = await prisma.auditStatus.findMany({
    select: { id: true, name: true },
  });
  auditStatuses.forEach((status) =>
    auditStatusesMap.set(status.name.toLowerCase(), status.id)
  );
  const defaultStatusId = auditStatusesMap.get(
    defaultAuditStatusName.toLowerCase()
  );

  if (!defaultStatusId) {
    console.error(
      `Default Audit Status "${defaultAuditStatusName}" not found.`
    );
    return;
  }
  if (
    !scriptRunnerUserId ||
    scriptRunnerUserId.includes("YOUR_ADMIN_USER_ID")
  ) {
    console.error(`scriptRunnerUserId is not set correctly.`);
    return;
  }

  for await (const record of records) {
    const clientName = record["Client Name"];
    if (!clientName) {
      console.warn("Skipping row: Missing Client Name.");
      continue;
    }
    console.log(`Processing client: ${clientName}`);

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Create Client
        const client = await tx.client.create({
          data: {
            clientName: clientName,
            abn: record["ABN"] || null,
            address: record["Address"] || null,
            city: record["City"] || null,
            postcode: record["Postcode"] || null,
            status: "active",
            auditMonthEnd: monthToNumber(record["Audit Month End"]),
            nextContactDate: parseCsvDate(record["Next Contact Date"]),
            estAnnFees: record["Est Ann Fees (ex GST)"]
              ? parseFloat(record["Est Ann Fees (ex GST)"].replace(/[,"]/g, ""))
              : null,
            // softwareAccess field removed from Client model
          },
        });
        console.log(`  Created client ${client.id}`);

        // 2. Create Contacts
        const createdContacts: {
          id: string;
          name: string | null;
          email: string | null;
        }[] = [];
        const emails = (record["Email"] || "")
          .split(/[,;]/)
          .map((e: string) => e.trim())
          .filter(Boolean);
        const contactNames = [
          record["Contact 1"],
          record["Contact 2"],
          record["Contact 3"],
        ].filter(Boolean);
        const contactPhones = [
          record["Phone 1"],
          record["Phone 2"],
          record["Phone 3"],
        ];

        for (let i = 0; i < contactNames.length; i++) {
          const contactData = {
            clientId: client.id,
            name: contactNames[i],
            phone: contactPhones[i] || null,
            email: emails[i] || null,
            title: `Contact ${i + 1}`,
            isPrimary: i === 0,
          };
          let existingContactByEmail = null;
          if (contactData.email) {
            try {
              existingContactByEmail = await tx.contact.findFirst({
                where: { email: contactData.email },
              });
            } catch (e: unknown) {
              console.error(
                `  Error checking email uniqueness for ${contactData.email}:`,
                e
              );
            }
          }
          if (existingContactByEmail) {
            console.warn(
              `  Contact with email ${contactData.email} exists (ID: ${existingContactByEmail.id}). Skipping.`
            );
          } else {
            try {
              const created = await tx.contact.create({ data: contactData });
              createdContacts.push(created);
              console.log(
                `    Created contact ${created.name} ${contactData.email ? `(${contactData.email})` : ""}`
              );
            } catch (e: unknown) {
              console.error(
                `  Error creating contact ${contactData.name} for client ${clientName}:`,
                e
              );
            }
          }
        }
        if (emails.length > contactNames.length) {
          for (let i = contactNames.length; i < emails.length; i++) {
            const email = emails[i];
            let existingContactByEmail = null;
            if (email) {
              try {
                existingContactByEmail = await tx.contact.findFirst({
                  where: { email: email },
                });
              } catch (e: unknown) {
                console.error(
                  `  Error checking email uniqueness for ${email}:`,
                  e
                );
              }
            }
            if (existingContactByEmail) {
              console.warn(
                `  Contact with email ${email} exists (ID: ${existingContactByEmail.id}). Skipping.`
              );
            } else if (email) {
              try {
                const created = await tx.contact.create({
                  data: {
                    clientId: client.id,
                    name: null,
                    email: email,
                    title: `Email Contact ${i + 1}`,
                    isPrimary: false,
                  },
                });
                createdContacts.push(created);
                console.log(`    Created contact (from extra email) ${email}`);
              } catch (e: unknown) {
                console.error(
                  `  Error creating contact for email ${email} for client ${clientName}:`,
                  e
                );
              }
            }
          }
        }

        const findContactIdByName = (
          name: string | undefined | null
        ): string | null => {
          if (!name) return null;
          const found = createdContacts.find((c) => c.name === name);
          return found?.id || null;
        };

        // 3. Create Licenses (Individually with Pre-check) - Revised
        const licensesToProcess: Prisma.LicenseCreateArgs["data"][] = [];
        if (record["Licence# Agency"]) {
          licensesToProcess.push({
            holderType: "client",
            clientId: client.id,
            licenseNumber: record["Licence# Agency"],
            licenseType: "Agency",
            renewalMonth: monthToNumber(record["Licence Month"]),
            isPrimary: true,
          });
        }
        const director1ContactId = findContactIdByName(record["Contact 1"]);
        if (record["Licence# Director 1"] && director1ContactId) {
          licensesToProcess.push({
            holderType: "contact",
            contactId: director1ContactId,
            licenseNumber: record["Licence# Director 1"],
            licenseType: "Director",
            renewalMonth: monthToNumber(record["Licence Month_1"]),
            isPrimary: false,
          });
        }
        const director2ContactId = findContactIdByName(record["Contact 2"]);
        if (record["Licence# Director 2"] && director2ContactId) {
          licensesToProcess.push({
            holderType: "contact",
            contactId: director2ContactId,
            licenseNumber: record["Licence# Director 2"],
            licenseType: "Director",
            renewalMonth: monthToNumber(record["Licence Month_2"]),
            isPrimary: false,
          });
        }

        let licensesCreatedCount = 0;
        for (const licenseData of licensesToProcess) {
          try {
            // Check if license number already exists BEFORE trying to create
            const existingLicense = await tx.license.findUnique({
              where: { licenseNumber: licenseData.licenseNumber },
              select: { id: true }, // Only select id for efficiency
            });

            if (existingLicense) {
              // License already exists, log and skip creation
              console.warn(
                `  Skipping license creation, number already exists: ${licenseData.licenseNumber}`
              );
            } else {
              // License doesn't exist, proceed with creation
              await tx.license.create({ data: licenseData });
              licensesCreatedCount++;
            }
          } catch (e: unknown) {
            // Catch any other unexpected errors during create/find
            console.error(
              `  Error processing license ${licenseData.licenseNumber}:`,
              e
            );
            // Re-throw to abort the transaction for this client if a *non-duplicate* error occurs
            throw e;
          }
        }
        if (licensesCreatedCount > 0)
          console.log(`    Created ${licensesCreatedCount} licenses`);

        // 4. Create Trust Account(s)
        if (record["Bank"]) {
          const softwareAccessRaw = record["Software & Access (y/n)"] || "";
          const hasAccess = softwareAccessRaw
            .trim()
            .toUpperCase()
            .startsWith("Y");
          let softwareName: string | null = null;
          if (hasAccess && softwareAccessRaw.includes("-")) {
            softwareName = softwareAccessRaw.split("-")[1]?.trim() || null;
          } else if (hasAccess) {
            console.warn(
              `  Software access marked 'Y' but no software name found for client ${clientName}. Raw value: "${softwareAccessRaw}"`
            );
          }

          await tx.trustAccount.create({
            data: {
              clientId: client.id,
              bankName: record["Bank"],
              hasSoftwareAccess: hasAccess,
              managementSoftware: softwareName,
              accountNumber: null, // Explicitly provide null
            },
          });
          console.log(
            `    Created trust account (Software Access: ${hasAccess}, Software: ${softwareName || "N/A"})`
          );
        }

        // 5. Create Initial Audit Record
        let initialAudit: { id: string; createdAt: Date } | null = null;
        const nextAuditYearEndStr = record["Next Audit Year End"];
        const auditYearMatch = nextAuditYearEndStr?.match(/(\d{2}|\d{4})$/);
        const auditYear = auditYearMatch
          ? parseInt(auditYearMatch[1]) < 100
            ? 2000 + parseInt(auditYearMatch[1])
            : parseInt(auditYearMatch[1])
          : new Date().getFullYear();
        const stageName = record["Status"]?.trim().toLowerCase();
        let stageId: number | undefined = undefined;
        if (stageName) {
          if (stageName.includes("final audit"))
            stageId = auditStagesMap.get("reporting");
          else if (stageName.includes("1st interim"))
            stageId = auditStagesMap.get("1st interim review");
          else if (stageName.includes("2nd interim"))
            stageId = auditStagesMap.get("2nd interim review");
          else stageId = auditStagesMap.get("planning");
          if (!stageId)
            console.warn(
              `  Could not map CSV Status "${record["Status"]}" to AuditStage ID for client ${clientName}.`
            );
        }
        let reportDueDate: Date | null = null;
        const auditMonthEndNum = monthToNumber(record["Audit Month End"]);
        if (auditMonthEndNum) {
          const yearEndMonthIndex = auditMonthEndNum - 1;
          const dueMonthIndex = (yearEndMonthIndex + 3) % 12;
          const dueYear = auditYear + (yearEndMonthIndex + 3 >= 12 ? 1 : 0);
          reportDueDate = new Date(Date.UTC(dueYear, dueMonthIndex + 1, 0));
        } else {
          console.warn(
            `  Cannot calculate reportDueDate for ${clientName} due to missing auditMonthEnd.`
          );
        }

        initialAudit = await tx.audit.create({
          data: {
            clientId: client.id,
            auditYear: auditYear,
            stageId: stageId,
            statusId: defaultStatusId,
            reportDueDate: reportDueDate,
            createdAt: new Date(),
          },
        });
        console.log(`    Created initial audit record for year ${auditYear}`);

        // 6. Create Activity Log Entries
        const activityLogEntries = parseActivityLog(record["Agile Notes"]);
        if (activityLogEntries.length > 0 && initialAudit) {
          const logData = activityLogEntries.map((entry) => ({
            auditId: initialAudit!.id,
            clientId: client.id,
            userId: scriptRunnerUserId,
            type: "note" as const,
            content: entry.content,
            createdAt: entry.date || initialAudit!.createdAt,
          }));
          const result = await tx.activityLog.createMany({
            data: logData,
            skipDuplicates: false,
          });
          console.log(`    Created ${result.count} activity log entries`);
        }
      }); // End Transaction
      successCount++;
    } catch (error: unknown) {
      errorCount++;
      console.error(`  !! Error processing client ${clientName}:`, error);
      // throw error; // Uncomment to stop on first error if needed
    }
  }

  console.log(`\nMigration finished.`);
  console.log(`  Successfully processed: ${successCount} clients.`);
  console.log(`  Errors encountered: ${errorCount} clients.`);
}

// Run the migration
main()
  .catch((e: unknown) => {
    console.error("Migration script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
