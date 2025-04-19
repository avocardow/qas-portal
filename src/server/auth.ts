import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type User as NextAuthUser, // Import base User type
} from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

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
  // No User augmentation here to avoid recursion
}

// Define a local type extending the base NextAuth User to include our optional roleId
interface UserForSignIn extends NextAuthUser {
  roleId?: number;
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    // --- CORRECTED signIn CALLBACK ---
    async signIn({ user, account }) {
      if (account?.provider === "azure-ad" && user.email) {
        const userExists = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!userExists) {
          // !!!!! REPLACE '4' with the ACTUAL ID of your default role !!!!!
          const defaultRoleId = 4; // <--- Set your correct default Role ID

          // Assert 'user' to our extended type before assigning roleId
          (user as UserForSignIn).roleId = defaultRoleId;
        }
      }
      return true;
    },
    // --- Session callback (Unchanged) ---
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        const userWithRole = await db.user.findUnique({
          where: { id: user.id },
          include: { role: true },
        });
        session.user.role = userWithRole?.role?.name ?? null;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
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
    // Add EmailProvider here later
  ],
  session: {
    strategy: "database",
  },
  // secret: env.NEXTAUTH_SECRET, // Ensure this is set
};

export const getServerAuthSession = () => getServerSession(authOptions);
