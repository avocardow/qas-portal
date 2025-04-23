import "dotenv/config";
import { GraphClient } from "../src/server/utils/graphClient";
import { PrismaClient } from "@prisma/client";

/**
 * Automated script to match Client records with SharePoint folders by name
 * and store the folder ID in sharepointFolderId.
 *
 * Requirements:
 * - Environment variable SHAREPOINT_DRIVE_ID must be set.
 * - GraphClient configured via AZURE_AD_* env variables.
 */

async function main() {
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  if (!driveId) {
    console.error("Error: Missing environment variable SHAREPOINT_DRIVE_ID");
    process.exit(1);
  }

  const graphClient = new GraphClient();
  const prisma = new PrismaClient();

  try {
    console.log(`Fetching folders from drive ${driveId}...`);
    const response = await graphClient.get<{
      value: { id: string; name: string }[];
    }>(`/drives/${driveId}/root:/Clients Folders:/children`);
    const folders = response.value;

    console.log(`Found ${folders.length} folder(s) under 'Clients Folders'.`);
    const clients = await prisma.client.findMany({
      select: { id: true, clientName: true },
    });
    console.log(`Processing ${clients.length} client(s)...`);

    let matched = 0;
    let unmatched = 0;
    let errors = 0;

    for (const client of clients) {
      const matches = folders.filter((f) => f.name === client.clientName);
      if (matches.length === 1) {
        const folderId = matches[0].id;
        try {
          await prisma.client.update({
            where: { id: client.id },
            data: { sharepointFolderId: folderId },
          });
          matched++;
          console.log(
            `✔ Matched '${client.clientName}' -> folder ${folderId}`
          );
        } catch (updateError) {
          errors++;
          console.error(
            `✖ Failed to update client '${client.clientName}':`,
            updateError
          );
        }
      } else if (matches.length === 0) {
        unmatched++;
        console.warn(`⚠ No folder found for client '${client.clientName}'`);
      } else {
        errors++;
        console.error(
          `✖ Multiple folders found for client '${client.clientName}': ${matches.map((f) => f.id).join(", ")}`
        );
      }
    }

    console.log(
      `Done. Matched: ${matched}, Unmatched: ${unmatched}, Errors: ${errors}`
    );
  } catch (err) {
    console.error("Fatal error during folder linking:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
