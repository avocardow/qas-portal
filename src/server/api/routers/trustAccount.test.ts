/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { createCaller } from "@/server/api/root";

const validUuid1 = "11111111-1111-1111-1111-111111111111";
const validUuid2 = "22222222-2222-2222-2222-222222222222";

describe("trustAccountRouter", () => {
  let db: DeepMockProxy<PrismaClient>;
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    db = mockDeep<PrismaClient>();
    // Mock transaction for batch updates
    db.$transaction = vi.fn((ops) => Promise.all(ops));
    caller = createCaller({
      db,
      session: { user: { id: "u1", role: "Admin" } } as any,
      headers: new Headers(),
    } as any);
  });

  it("should create a trust account", async () => {
    const input = {
      clientId: validUuid1,
      bankName: "Bank",
      bsb: "123456",
      accountNumber: "7890",
    };
    const created = { id: validUuid1, ...input };
    db.trustAccount.create.mockResolvedValue(created as any);

    const result = await caller.trustAccount.create(input as any);
    expect(result).toEqual(created);
    expect(db.trustAccount.create).toHaveBeenCalledWith({ data: input });
  });

  it("should update a trust account", async () => {
    const input = {
      trustAccountId: validUuid1,
      clientId: validUuid1,
      bankName: "Bank",
      primaryLicenseId: validUuid2,
    };
    const updated = { id: validUuid1, ...input };
    db.trustAccount.update.mockResolvedValue(updated as any);

    const result = await caller.trustAccount.update(input as any);
    expect(result).toEqual(updated);
    expect(db.trustAccount.update).toHaveBeenCalledTimes(1);
  });

  it("should batch create trust accounts", async () => {
    const items = [{ clientId: validUuid1, bankName: "B1" }];
    const batchResult = { count: 1 };
    db.trustAccount.createMany.mockResolvedValue(batchResult as any);

    const result = await caller.trustAccount.batchCreate(items as any);
    expect(result).toEqual(batchResult);
    expect(db.trustAccount.createMany).toHaveBeenCalledWith({
      data: items,
      skipDuplicates: true,
    });
  });

  it("should batch update trust accounts", async () => {
    const items = [
      { trustAccountId: validUuid1, clientId: validUuid1, bankName: "B1" },
      { trustAccountId: validUuid2, clientId: validUuid2, bankName: "B2" },
    ];
    const res1 = { id: validUuid1 };
    const res2 = { id: validUuid2 };
    db.trustAccount.update
      .mockResolvedValueOnce(res1 as any)
      .mockResolvedValueOnce(res2 as any);

    const result = await caller.trustAccount.batchUpdate(items as any);
    expect(result).toHaveLength(items.length);
    expect(db.trustAccount.update).toHaveBeenCalledTimes(items.length);
    expect(db.$transaction).toHaveBeenCalled();
  });

  it("should forbid unauthorized access", async () => {
    const clientCaller = createCaller({
      db,
      session: { user: { id: "u2", role: "Client" } } as any,
      headers: new Headers(),
    } as any);
    await expect(
      clientCaller.trustAccount.create({
        clientId: validUuid1,
        bankName: "B",
      } as any)
    ).rejects.toHaveProperty("code", "FORBIDDEN");
  });
});
