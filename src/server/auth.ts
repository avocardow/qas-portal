import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type User as NextAuthUser,
} from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { sendEmail } from "@/server/utils/msGraphEmail";

import { env } from "@/env.mjs";
import { db } from "@/server/db";
import { type Role } from "@prisma/client";

// --- Module Augmentation (Session only) ---
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role["name"] | null;
    } & DefaultSession["user"];
  }
}

// Define a local type extending the base NextAuth User to include our optional roleId
interface UserForSignIn extends NextAuthUser {
  roleId?: number;
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    // --- signIn Callback (Unchanged) ---
    async signIn({ user }) {
      // Assign default role for new users based on email
      if (user.email) {
        const userExists = await db.user.findUnique({ where: { email: user.email } });
        if (!userExists) {
          const defaultRoleName = "Client"; // Change to desired default role
          const defaultRole = await db.role.findUnique({ where: { name: defaultRoleName } });
          if (!defaultRole) {
            throw new Error(`Default role '${defaultRoleName}' not found in database`);
          }
          (user as UserForSignIn).roleId = defaultRole.id;
        }
      }
      return true;
    },
    // --- Session callback (Logs Removed) ---
    session: async ({ session, user }) => {
      // console.log(">>> Session callback hit for user:", user.id); // REMOVED
      if (session.user) {
        session.user.id = user.id;
        try {
          const userWithRole = await db.user.findUnique({
            where: { id: user.id },
            include: { role: true },
          });
          // console.log(">>> User fetched in session callback:", userWithRole); // REMOVED
          session.user.role = userWithRole?.role?.name ?? null;
        } catch (error) {
          console.error(
            ">>> Error fetching user/role in session callback:",
            error
          ); // Keep error log
          session.user.role = null;
        }
      }
      // console.log(">>> Returning session:", session); // REMOVED
      return session;
    },
    // Always redirect authenticated users to the dashboard
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  adapter: {
    ...PrismaAdapter(db),
    createUser: async (data: AdapterUser) => {
      // Assign the 'Client' role by default and set m365ObjectId
      const defaultRoleName = "Client";
      const defaultRole = await db.role.findUnique({ where: { name: defaultRoleName } });
      if (!defaultRole) {
        throw new Error(`Default role '${defaultRoleName}' not found in database`);
      }
      // Create user with default roleId and store m365ObjectId for Azure logins
      return await db.user.create({ data: { ...data, roleId: defaultRole.id, m365ObjectId: data.id } });
    },
  },
  providers: [
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read",
        },
      },
    }),
    EmailProvider({
      maxAge: 24 * 60 * 60, // 24 hours
      from: env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const subject = `Sign in to ${provider.name}`;
        const htmlBody = `<p>Click <a href="${url}">here</a> to sign in.</p>`;
        try {
          await sendEmail({ to: email, subject, htmlBody });
          console.log(
            `>>> Verification email sent to ${email} for provider ${provider.name}`
          );
        } catch (error) {
          console.error("<<< Error sending verification email:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  // secret: env.NEXTAUTH_SECRET, // Ensure this is set
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'azure-ad') {
        await db.user.update({
          where: { id: user.id },
          data: {
            m365ObjectId: profile?.oid || user.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            image: (profile as any)?.picture || null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emailVerified: (profile as any)?.email_verified ? new Date((profile as any).email_verified) : user.emailVerified,
          },
        });
      }
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
