import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  EmailService,
  MailFolder,
  EmailMessage,
} from "@/server/services/emailService";

const emailService = new EmailService();

export const emailRouter = createTRPCRouter({
  listFolders: protectedProcedure.query(async (): Promise<MailFolder[]> => {
    return await emailService.listFolders();
  }),

  listMessages: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(
      async ({
        input,
      }): Promise<{ messages: EmailMessage[]; nextLink?: string }> => {
        return await emailService.listMessages(
          input.folderId,
          input.page,
          input.pageSize
        );
      }
    ),

  getMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .query(async ({ input }) => {
      return await emailService.getMessage(input.messageId);
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        to: z.array(z.string().email()),
        cc: z.array(z.string().email()).default([]),
        bcc: z.array(z.string().email()).default([]),
        subject: z.string().min(1),
        htmlBody: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      await emailService.sendMessage(
        input.to,
        input.cc,
        input.bcc,
        input.subject,
        input.htmlBody
      );
      return { success: true };
    }),

  createReply: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        comment: z.string().default(""),
      })
    )
    .mutation(async ({ input }) => {
      return await emailService.createReply(input.messageId, input.comment);
    }),

  createForward: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        comment: z.string().default(""),
        to: z.array(z.string().email()),
      })
    )
    .mutation(async ({ input }) => {
      return await emailService.createForward(
        input.messageId,
        input.comment,
        input.to
      );
    }),
});
