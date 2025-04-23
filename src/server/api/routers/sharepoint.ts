import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  enforceRole,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { GraphClient } from "@/server/utils/graphClient";

export const sharepointRouter = createTRPCRouter({
  listClientFolders: protectedProcedure
    .use(enforceRole(["Admin", "Manager"]))
    .query(async () => {
      const driveId = process.env.SHAREPOINT_DRIVE_ID;
      if (!driveId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SharePoint drive ID is not configured",
        });
      }
      const graphClient = new GraphClient();
      const response = await graphClient.get<{
        value: { id: string; name: string }[];
      }>(`/drives/${driveId}/root:/Clients Folders:/children`);
      return response.value.map((folder) => ({
        id: folder.id,
        name: folder.name,
      }));
    }),

  getFolderContents: protectedProcedure
    .use(enforceRole(["Admin", "Manager"]))
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      const driveId = process.env.SHAREPOINT_DRIVE_ID;
      if (!driveId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SharePoint drive ID is not configured",
        });
      }
      const graphClient = new GraphClient();
      const response = await graphClient.get<{
        value: Array<{
          id: string;
          name: string;
          webUrl: string;
          folder?: unknown;
          lastModifiedDateTime: string;
        }>;
      }>(`/drives/${driveId}/items/${input.folderId}/children`);
      return response.value.map((item) => ({
        id: item.id,
        name: item.name,
        webUrl: item.webUrl,
        isFolder: typeof item.folder !== "undefined",
        lastModifiedDateTime: item.lastModifiedDateTime,
      }));
    }),
});
