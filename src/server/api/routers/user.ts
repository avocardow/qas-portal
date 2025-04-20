import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { randomBytes } from "crypto";
import { sendEmail } from "@/server/utils/msGraphEmail";
import { env } from "@/env.mjs";

export const userRouter = createTRPCRouter({
  inviteClientContact: protectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // RBAC: only Admins can invite clients
      if (ctx.session.user.role !== "Admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can invite clients.",
        });
      }

      // Fetch and validate contact
      const contact = await ctx.db.contact.findUnique({
        where: { id: input.contactId },
      });
      if (!contact || !contact.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contact not found or missing email.",
        });
      }
      if (contact.canLoginToPortal) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contact is already invited.",
        });
      }

      // Create user, update contact and token generation in a transaction
      const activationToken = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

      await ctx.db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: contact.email,
            name: contact.name,
            role: { connect: { name: "Client" } },
          },
        });

        await tx.contact.update({
          where: { id: contact.id },
          data: { canLoginToPortal: true, portalUserId: newUser.id },
        });

        await tx.verificationToken.create({
          data: {
            identifier: contact.id,
            token: activationToken,
            expires: expiry,
          },
        });
      });

      // Send invitation email using Graph API
      const activationLink = `${env.NEXTAUTH_URL}/complete-setup?token=${activationToken}`;
      await sendEmail({
        to: contact.email,
        subject: "Invitation to QAS Portal",
        htmlBody: `<p>Hello ${contact.name},</p><p>You have been invited to access the QAS Portal. Please click <a href="${activationLink}">here</a> to complete your account setup. This link will expire in 24 hours.</p>`,
      });
      return { success: true };
    }),
});
