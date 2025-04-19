import NextAuth from "next-auth";
// Import the single source of truth for authOptions
import { authOptions } from "@/server/auth"; // Adjust path if needed ('~/server/auth' is common in T3)

// Initialize NextAuth with the imported options
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests as required by Next.js App Router
export { handler as GET, handler as POST };
