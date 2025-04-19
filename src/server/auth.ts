import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad"; // Or MicrosoftEntraIdProvider

import { env } from "@/env.mjs"; // Using T3 Env validation
import { db } from "@/server/db"; // Your Prisma client instance
import { type Role } from "@prisma/client"; // Import Role type if needed elsewhere, otherwise Prisma handles it

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // Add your role type here - adjust if your role name isn't just string
      role: Role["name"] | null; // Use Role['name'] for type safety if Role model exists
    } & DefaultSession["user"];
  }

  // If you need to augment the User object passed to callbacks (optional)
  // interface User {
  //   roleId: number; // Assuming roleId is on the User model from DB
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 * THIS is where authOptions should be defined and exported.
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    // Corrected session callback: Fetch role from DB using user.id
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id; // Add the user ID to the session

        // Fetch the user from DB to get the role
        const userWithRole = await db.user.findUnique({
          where: { id: user.id },
          include: { role: true }, // Include the related Role record
        });

        // Assign the role name to the session user
        session.user.role = userWithRole?.role?.name ?? null; // Handle case where role might not be found
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    AzureADProvider({
      // Or MicrosoftEntraIdProvider
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
      // Define scopes needed for profile info and potentially refresh tokens
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read", // Added User.Read as a common one
        },
      },
    }),
    /**
     * ...add more providers here if needed (e.g., EmailProvider for client login)
     */
  ],
  session: {
    strategy: "database", // Use database session strategy for persistence
  },
  // secret: env.NEXTAUTH_SECRET, // Secret is generally needed, ensure it's set in env
  // pages: { // Optional: Define custom sign-in pages if needed later
  //   signIn: '/signin',
  // }
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 * This should be the ONLY definition of this function.
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
