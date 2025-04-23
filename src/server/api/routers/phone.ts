import { createTRPCRouter, permissionProcedure } from "@/server/api/trpc";
import { PHONE_PERMISSIONS } from "@/constants/permissions";
import { GraphClient } from "@/server/utils/graphClient";
import { env } from "@/env.mjs";
import { z } from "zod";
import { db } from "@/server/db";

export const phoneRouter = createTRPCRouter({
  makePstnCall: permissionProcedure(PHONE_PERMISSIONS.MAKE_CALL)
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        contactId: z.string().uuid().optional(),
        number: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const graphClient = new GraphClient();
      const callbackUri = `${env.NEXTAUTH_URL}/api/phone/callback`;
      const { number, clientId, contactId } = input;
      const payload = {
        callbackUri,
        targets: [{ identity: { phone: { number } } }],
        requestedModalities: ["audio"],
        mediaConfig: { unmute: {} },
      };
      const result = await graphClient.post<{ id: string }>(
        "/communications/calls",
        payload
      );
      const callLog = await db.callLog.create({
        data: {
          callingUserId: ctx.session.user.id,
          clientId,
          contactId,
          dialedNumber: number,
          startTime: new Date(),
          teamsCallId: result.id,
        },
      });
      return { ...result, callLogId: callLog.id };
    }),
  logCall: permissionProcedure(PHONE_PERMISSIONS.LOG_CALL)
    .input(
      z.object({
        callLogId: z.string().uuid(),
        endTime: z.date(),
        durationSeconds: z.number(),
        notes: z.string().optional(),
        transcript: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { callLogId, endTime, durationSeconds, notes, transcript } = input;
      const updated = await db.callLog.update({
        where: { id: callLogId },
        data: {
          endTime,
          durationSeconds,
          notes,
          transcript,
        },
      });
      return updated;
    }),
});
