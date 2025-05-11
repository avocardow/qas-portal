import { PrismaClient } from "@prisma/client";
import type { Prisma, ClientStatus, Contact, ActivityLogType } from "@prisma/client";
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

// --- Add global error handlers ---
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in migration script:', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in migration script:', reason);
  process.exit(1);
});

// --- Configuration ---
const csvFilePath = path.resolve(__dirname, "../data/client-database-11may2025.csv");
// !!!!! REPLACE 'YOUR_ADMIN_USER_ID' with the actual UUID of the user running the script !!!!!
const scriptRunnerUserId = "521d8e57-7a65-4f3c-9b12-8d3e4f6a7b1c"; // <<<--- CONFIRM/CHANGE THIS
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

// Replace parseCsvDate to enforce Australian DD/MM/YYYY or DD/MM/YY formats
function parseCsvDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr?.trim()) return null;
  const trimmed = dateStr.trim();
  const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) {
    console.warn(`Date "${dateStr}" not in DD/MM/YYYY or DD/MM/YY format`);
    return null;
  }
  const [, dayStr, monthStr, yearStr] = m;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  let year = parseInt(yearStr, 10);
  if (yearStr.length === 2) year += 2000;
  // Validate day/month
  const daysInMonth = [31, ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]!) {
    console.warn(`Invalid date "${dateStr}"`);
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Parse a log string into date/content pairs.
 * Supports dd/MM/yyyy or dd/MM/yy (Excel style) at start,
 * with optional leading apostrophe and hyphen separators.
 */
function parseActivityLog(
  logText: string | undefined | null
): { date: Date | null; content: string }[] {
  if (!logText?.trim()) return [];
  const trimmed = logText.trim();
  // split on semicolons
  const parts = trimmed.split(/\s*;\s*/).map((p) => p.trim()).filter(Boolean);
  const pattern = /^'?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b(?:\s*-\s*|\s+)([\s\S]+)/;
  const results: { date: Date | null; content: string }[] = [];
  parts.forEach((part) => {
    const m = part.match(pattern);
    if (m) {
      const d = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10);
      let y = parseInt(m[3], 10);
      if (m[3].length === 2) y += 2000;
      const date = new Date(Date.UTC(y, mo - 1, d));
      const content = m[4].trim();
      results.push({ date, content });
    } else {
      // no leading date, store entire part
      results.push({ date: null, content: part });
    }
  });
  return results;
}

// Helper to infer activity log type from content (using string literals)
function determineLogType(content: string): ActivityLogType {
  const lc = content.toLowerCase();
  if (/email/i.test(lc)) return 'email_sent';
  if (/recd|received/i.test(lc)) return 'email_received';
  if (/call|phoned/.test(lc)) return 'call_in';
  return 'note';
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
    relax_column_count: true,
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

  // Create normalized auditStagesMap for matching names without hyphens/spaces
  const auditStagesMapNormalized = new Map<string, number>();
  auditStagesMap.forEach((id, name) => {
    const normalized = name.replace(/[-\s]/g, "");
    auditStagesMapNormalized.set(normalized, id);
  });

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
        // Prepare client-status mapping from CSV (Active, Archived, Prospect)
        const statusKey = Object.keys(record).find((k) => k.trim().toLowerCase() === "status");
        if (!statusKey) {
          console.warn(`  Status column not found for client ${clientName}, defaulting to active`);
        }
        const clientStatusRaw = statusKey ? record[statusKey]?.trim().toLowerCase() : undefined;
        const clientStatus = ["active", "archived", "prospect"].includes(clientStatusRaw)
          ? (clientStatusRaw as ClientStatus)
          : "active";
        // Prepare External Folder field: extract URL if present, else keep raw value
        const rawExternalFolder = record["External Folder"]?.trim() || null;
        let externalFolderVal: string | null = null;
        if (rawExternalFolder) {
          const urlMatch = rawExternalFolder.match(/https?:\/\/\S+/);
          externalFolderVal = urlMatch ? urlMatch[0] : rawExternalFolder;
        }
        // Prepare user map and assign manager to client.assignedUserId
        const managerKey = Object.keys(record).find((k) => k.trim().toLowerCase() === "manager");
        let assignedUserId: string | undefined;
        if (managerKey) {
          const mgrCode = record[managerKey]?.split(/[;,\/]+/)[0]?.trim();
          const userMapForManager: Record<string, string> = {
            DC: "6f2b3c4d-5e6f-4a7b-8c9d-0a1b2c3d4e5f",
            AC: "0a1b2c3d-4e5f-4a6b-8c9d-1e2f3a4b5c6d",
            KP: "7e8f9a0b-1c2d-4e3f-5a6b-7c8d9e0f1a2b",
          };
          if (mgrCode && userMapForManager[mgrCode]) {
            assignedUserId = userMapForManager[mgrCode];
          } else if (mgrCode) {
            console.warn(`  Unknown manager code: ${mgrCode} for client ${clientName}`);
          }
        } else {
          console.warn(`  Manager column not found for client ${clientName}`);
        }
        // Determine actual CSV 'Fees' header key, trimming whitespace
        const feesKey = Object.keys(record).find((k) =>
          k.trim().toLowerCase().includes("est ann fees")
        );
        const feesValue = feesKey ? record[feesKey]?.trim() : undefined;
        // Parse Estimated Annual Fees, stripping non-numeric characters; assume AUD
        const estAnnFeesVal = feesValue
          ? parseFloat(feesValue.replace(/[^0-9.\-]/g, ""))
          : null;

        const client = await tx.client.create({
          data: {
            clientName,
            abn: record["ABN"] || null,
            address: record["Address"] || null,
            city: record["City"] || null,
            postcode: record["Postcode"] || null,
            phone: record["Phone 1"] || null,
            email: record["Email"]?.split(/[,;]/).map((e: string) => e.trim())[0] || null,
            status: clientStatus,
            assignedUserId: assignedUserId || undefined,
            // Map Audit Period End Date using Next Audit Year End (DD/MM/YYYY)
            auditPeriodEndDate: parseCsvDate(record["Next Audit Year End"]),
            nextContactDate: parseCsvDate(record["Next Contact Date"]),
            estAnnFees: estAnnFeesVal,
            externalFolder: externalFolderVal,
          },
        });
        const feeDisplay = estAnnFeesVal != null ? estAnnFeesVal.toFixed(2) : "N/A";
        console.log(`  Created client ${client.id} (EstAnnFees: AUD ${feeDisplay})`);

        // 2. Create Contacts
        const createdContacts: {
          id: string;
          name: string | null;
          email: string | null;
        }[] = [];
        const emails = (record["Email"] || "")
          .split(/;/)
          .map((e: string) => e.trim())
          .filter(Boolean);
        const contactNames = [
          record["Contact 1"],
          record["Contact 2"],
          record["Contact 3"],
        ];
        const contactPhones = [
          record["Phone 1"],
          record["Phone 2"],
        ];

        for (let i = 0; i < emails.length; i++) {
          const contactData = {
            clientId: client.id,
            name: contactNames[i] || null,
            phone: contactPhones[i] || null,
            email: emails[i],
            title: `Contact ${i + 1}`,
            isPrimary: i === 0,
          };
          let existingContactByEmail: Contact | null = null;
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
          const softwareAccess = softwareAccessRaw.trim();
          const hasAccess = softwareAccess.toUpperCase() === "Y";
          let softwareName: string | null = null;
          if (hasAccess && softwareAccess.includes("-")) {
            softwareName = softwareAccess.split("-")[1]?.trim() || null;
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
        // Parse Next Audit Year End (DD/MM/YYYY) for audit period and year
        const auditDate = parseCsvDate(record["Next Audit Year End"]);
        const auditYear = auditDate ? auditDate.getUTCFullYear() : new Date().getFullYear();
        // Map Audit Stage using normalization and alias for final audit
        const rawStage = record["Stage"]?.trim().toLowerCase() || "";
        const stageAliases: Record<string, string> = {
          "final audit": "year-end audit",
        };
        const mappedStage = stageAliases[rawStage] || rawStage;
        let stageId: number | undefined = auditStagesMap.get(mappedStage);
        if (!stageId && mappedStage) {
          const normRaw = mappedStage.replace(/[-\s]/g, "");
          stageId = auditStagesMapNormalized.get(normRaw);
        }
        if (!stageId) {
          console.warn(`Could not map Audit Stage "${record["Stage"]}" (raw: ${rawStage})`);
        }
        // Compute Report Due Date as auditDate + 4 months, last day of that month
        let reportDueDate: Date | null = null;
        if (auditDate) {
          const year = auditDate.getUTCFullYear();
          const monthIndex = auditDate.getUTCMonth();
          const dueTotal = monthIndex + 4;
          const dueYear = year + Math.floor(dueTotal / 12);
          const dueMonthIndex = dueTotal % 12;
          reportDueDate = new Date(Date.UTC(dueYear, dueMonthIndex + 1, 0));
        } else {
          console.warn(
            `  Cannot calculate reportDueDate for ${clientName} due to invalid Next Audit Year End ("${record["Next Audit Year End"]}")`
          );
        }

        // Before creating audit, map the CSV 'Audit Status' column
        const auditStatusCol = Object.keys(record).find(k =>
          k.trim().toLowerCase() === "audit status"
        );
        const auditStatusRaw = auditStatusCol
          ? record[auditStatusCol]?.trim().toLowerCase()
          : undefined;
        const auditStatusId = auditStatusesMap.get(auditStatusRaw) ?? defaultStatusId;

        initialAudit = await tx.audit.create({
          data: {
            clientId: client.id,
            auditYear: auditYear,
            stageId: stageId,
            statusId: auditStatusId,
            reportDueDate: reportDueDate,
            createdAt: new Date(),
          },
        });
        // 5.b Create Audit Assignments for Staff Assigned and Manager
        const userMap: Record<string, string> = {
          // TODO: Populate mapping of staff codes to actual user IDs
          DC: "6f2b3c4d-5e6f-4a7b-8c9d-0a1b2c3d4e5f",
          AC: "0a1b2c3d-4e5f-4a6b-8c9d-1e2f3a4b5c6d",
          KP: "7e8f9a0b-1c2d-4e3f-5a6b-7c8d9e0f1a2b",
        };

        const assignRole = async (codes: string | undefined | null, role: string) => {
          (codes || "")
            .split(/[;,\/]+/)
            .map((c) => c.trim())
            .filter(Boolean)
            .forEach(async (code) => {
              const userId = userMap[code];
              if (userId) {
                await tx.auditAssignment.create({ data: { auditId: initialAudit!.id, userId, role } });
                console.log(`    Created ${role} assignment for ${code}`);
              } else {
                console.warn(`  Unknown ${role} code: ${code} for client ${clientName}`);
              }
            });
        };
        await assignRole(record["Staff Assigned"], "staff");
        console.log(`    Created initial audit record for year ${auditYear}`);

        // 6. Create Activity Log Entries from "Notes" column
        const rawNotes = record["Notes"] || "";
        const activityLogEntries = parseActivityLog(rawNotes);
        if (activityLogEntries.length > 0 && initialAudit) {
          const logData = activityLogEntries.map((entry) => ({
            auditId: initialAudit!.id,
            clientId: client.id,
            createdBy: scriptRunnerUserId,
            type: determineLogType(entry.content),
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
