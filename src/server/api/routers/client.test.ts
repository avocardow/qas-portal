/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { clientRouter } from "./client";
import { TRPCError } from "@trpc/server";

describe("clientRouter updateSharepointFolderId", () => {
  let ctx: any;
  let callClient: any;
  const dummyClientId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  beforeEach(() => {
    callClient = createCallerFactory(clientRouter);
    ctx = {
      db: {
        client: {
          update: vi.fn(),
        },
      },
      session: { user: { role: "Admin" } },
    } as any;
  });

  it("should update sharepointFolderId for Admin", async () => {
    const updated = { id: dummyClientId, sharepointFolderId: "folder123" };
    ctx.db.client.update.mockResolvedValue(updated);
    const caller = callClient(ctx);
    const result = await caller.updateSharepointFolderId({
      clientId: dummyClientId,
      sharepointFolderId: "folder123",
    });
    expect(ctx.db.client.update).toHaveBeenCalledWith({
      where: { id: dummyClientId },
      data: { sharepointFolderId: "folder123" },
    });
    expect(result).toEqual(updated);
  });

  it("should allow Manager role", async () => {
    ctx.session.user.role = "Manager";
    const updated = { id: dummyClientId, sharepointFolderId: "folder456" };
    ctx.db.client.update.mockResolvedValue(updated);
    const caller = callClient(ctx);
    const result = await caller.updateSharepointFolderId({
      clientId: dummyClientId,
      sharepointFolderId: "folder456",
    });
    expect(result).toEqual(updated);
  });

  it("should forbid non-Admin/Manager", async () => {
    ctx.session.user.role = "Client";
    const caller = callClient(ctx);
    await expect(
      caller.updateSharepointFolderId({
        clientId: dummyClientId,
        sharepointFolderId: "folder123",
      })
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
