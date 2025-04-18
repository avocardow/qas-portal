import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; // Example provider

import { env } from "@/env.mjs";
import { db } from "@/server/db";

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
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub, // Use token.sub which is the user ID from the database
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      // Configure the credentials provider here
      // You'll likely want to replace this with OAuth providers like Discord, Google, etc.
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }; // Example user

        // Replace this with your actual user validation logic
        // For example, find a user in your database matching the credentials
        // const user = await db.user.findUnique({ where: { email: credentials.email } });
        // if (user && await compare(credentials.password, user.password)) {
        //  return user;
        // }

        // For now, returning a dummy user for setup purposes
        // IMPORTANT: Replace this with real authentication logic!
        if (
          credentials?.username === "admin" &&
          credentials?.password === "password"
        ) {
          return { id: "1", name: "Admin User", email: "admin@example.com" };
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example,
     * configuring database adapters AFTER running `prisma generate`...
     * @see https://next-auth.js.org/providers/
     */
  ],
  session: {
    strategy: "jwt", // Use JWT for session strategy with CredentialsProvider
  },
  secret: env.NEXTAUTH_SECRET,
  // pages: { // Optional: Define custom sign-in pages
  //   signIn: '/auth/signin',
  // }
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
