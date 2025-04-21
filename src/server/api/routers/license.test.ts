/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { createCaller } from "@/server/api/root";

const validUuid1 = "11111111-1111-1111-1111-111111111111";
const validUuid2 = "22222222-2222-2222-2222-222222222222";

describe("licenseRouter", () => {
  let db: DeepMockProxy<PrismaClient>;
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    db = mockDeep<PrismaClient>();
    db.$transaction = vi.fn((ops) => Promise.all(ops));
    caller = createCaller({
      db,
      session: { user: { id: "u1", role: "Admin" } } as any,
      headers: new Headers(),
    } as any);
  });

  it("should create a license", async () => {
    const input = {
      holderType: "client",
      licenseNumber: "L1",
      clientId: validUuid1,
    };
    const created = { id: validUuid1, ...input };
    db.license.create.mockResolvedValue(created as any);

    const result = await caller.license.create(input as any);
    expect(result).toEqual(created);
    expect(db.license.create).toHaveBeenCalledWith({ data: input });
  });

  it("should update a license", async () => {
    const input = {
      licenseId: validUuid1,
      holderType: "client",
      licenseNumber: "L2",
    };
    const updated = { id: validUuid1, ...input };
    db.license.update.mockResolvedValue(updated as any);

    const result = await caller.license.update(input as any);
    expect(result).toEqual(updated);
    expect(db.license.update).toHaveBeenCalledTimes(1);
  });

  it("should batch create licenses", async () => {
    const input = [
      { holderType: "contact", licenseNumber: "L3", clientId: validUuid2 },
      { holderType: "client", licenseNumber: "L4" },
    ];
    const batchResult = { count: 1 };
    db.license.createMany.mockResolvedValue(batchResult as any);

    const result = await caller.license.batchCreate(input as any);
    expect(result).toEqual(batchResult);
    expect(db.license.createMany).toHaveBeenCalledWith({
      data: input,
      skipDuplicates: true,
    });
  });

  it("should batch update licenses", async () => {
    const items = [
      { licenseId: validUuid1, holderType: "client", licenseNumber: "LN1" },
      { licenseId: validUuid2, holderType: "contact", licenseNumber: "LN2" },
    ];
    const res1 = { id: validUuid1 };
    const res2 = { id: validUuid2 };
    db.license.update
      .mockResolvedValueOnce(res1 as any)
      .mockResolvedValueOnce(res2 as any);

    const result = await caller.license.batchUpdate(items as any);
    expect(result).toHaveLength(items.length);
    expect(db.license.update).toHaveBeenCalledTimes(items.length);
    expect(db.$transaction).toHaveBeenCalled();
  });

  it("should forbid unauthorized access", async () => {
    const clientCaller = createCaller({
      db,
      session: { user: { id: "u2", role: "Client" } } as any,
      headers: new Headers(),
    } as any);
    await expect(
      clientCaller.license.create({
        holderType: "client",
        licenseNumber: "L4",
      } as any)
    ).rejects.toHaveProperty("code", "FORBIDDEN");
  });
});
