import "dotenv/config";
import { createTRPCContext } from "../src/server/api/trpc";
import { createCaller } from "../src/server/api/root";

async function main() {
  const contactId = process.argv[2];
  if (!contactId) {
    console.error("Usage: tsx scripts/send-invite.ts <contactId>");
    process.exit(1);
  }

  // Create tRPC context (no real headers needed for server-side)
  const ctx = await createTRPCContext({ headers: new Headers() });

  // Ensure session has Admin privileges if needed
  if (ctx.session?.user) {
    ctx.session.user.role = "Admin";
  }

  const caller = createCaller(ctx);
  try {
    const result = await caller.user.inviteClientContact({ contactId });
    console.log("Invitation sent successfully:", result);
  } catch (err) {
    console.error("Failed to send invitation:", err);
    process.exit(1);
  }
}

main();
