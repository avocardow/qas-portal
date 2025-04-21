/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { createCaller } from "@/server/api/root";

interface TestContext {
  db: DeepMockProxy<PrismaClient>;
  caller: ReturnType<typeof createCaller>;
}

const validUuid1 = "11111111-1111-1111-1111-111111111111";
const validUuid2 = "22222222-2222-2222-2222-222222222222";

describe("contactRouter", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = {
      db: mockDeep<PrismaClient>(),
      caller: null as any,
    };
    // Mock transaction to resolve input ops
    ctx.db.$transaction = vi.fn((ops) => Promise.all(ops));
    // Create caller with Admin role
    ctx.caller = createCaller({
      db: ctx.db,
      session: { user: { id: "u1", role: "Admin" } } as any,
      headers: new Headers(),
    } as any);
  });

  it("should create a contact", async () => {
    const input = { clientId: validUuid1, name: "Test", email: "a@b.com" };
    const created = { id: "id1", ...input };
    ctx.db.contact.create.mockResolvedValue(created as any);

    const result = await ctx.caller.contact.create(input);
    expect(result).toEqual(created);
    expect(ctx.db.contact.create).toHaveBeenCalledWith({ data: input });
  });

  it("should update a contact", async () => {
    const input = { contactId: validUuid1, clientId: validUuid1, name: "New" };
    const updated = { id: validUuid1, ...input };
    ctx.db.contact.update.mockResolvedValueOnce(updated as any);

    const result = await ctx.caller.contact.update(input as any);
    expect(result).toEqual(updated);
    expect(ctx.db.contact.update).toHaveBeenCalledTimes(1);
  });

  it("should batch create contacts", async () => {
    const input = [{ clientId: validUuid1 }, { clientId: validUuid2 }];
    const batchResult = { count: 2 };
    ctx.db.contact.createMany.mockResolvedValue(batchResult as any);

    const result = await ctx.caller.contact.batchCreate(input as any);
    expect(result).toEqual(batchResult);
    expect(ctx.db.contact.createMany).toHaveBeenCalledWith({
      data: input,
      skipDuplicates: true,
    });
  });

  it("should batch update contacts", async () => {
    const input = [
      { contactId: validUuid1, clientId: validUuid1 },
      { contactId: validUuid2, clientId: validUuid2 },
    ];
    const updateRes = [{ id: validUuid1 }, { id: validUuid2 }];
    ctx.db.contact.update
      .mockResolvedValueOnce(updateRes[0] as any)
      .mockResolvedValueOnce(updateRes[1] as any);

    const result = await ctx.caller.contact.batchUpdate(input as any);
    expect(result).toHaveLength(updateRes.length);
    expect(ctx.db.contact.update).toHaveBeenCalledTimes(2);
    expect(ctx.db.$transaction).toHaveBeenCalled();
  });

  it("should forbid unauthorized access", async () => {
    // Use Client role
    const clientCaller = createCaller({
      db: ctx.db,
      session: { user: { id: "u2", role: "Client" } } as any,
      headers: new Headers(),
    } as any);

    await expect(
      clientCaller.contact.create({ clientId: validUuid1 } as any)
    ).rejects.toHaveProperty("code", "FORBIDDEN");
  });
});
