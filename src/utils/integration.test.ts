import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/server/db";
import { createCaller } from "@/server/api/root";
import type { createTRPCContext } from "@/server/api/trpc";

let caller: ReturnType<typeof createCaller>;

beforeAll(() => {
  // Manually construct context for integration tests without Next.js request scope
  const ctx = {
    db,
    session: null,
    headers: new Headers(),
  } as Awaited<ReturnType<typeof createTRPCContext>>;
  caller = createCaller(ctx);
});

describe("Integration Test Scenarios", () => {
  it("health endpoint should return ok", async () => {
    const res = await caller.health();
    expect(res.status).toBe("ok");
  });

  it("example.hello should greet properly", async () => {
    const greeting = await caller.example.hello({ text: "Vitest" });
    expect(greeting.greeting).toBe("Hello Vitest");
  });

  it("protected getSecretMessage should throw UNAUTHORIZED error", async () => {
    await expect(caller.example.getSecretMessage()).rejects.toThrowError(
      /UNAUTHORIZED/
    );
  });
});
