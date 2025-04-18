import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";

// Use consolidated authOptions from server/auth.ts for providers, adapter, callbacks, and secret
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 