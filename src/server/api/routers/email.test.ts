/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { emailRouter } from "./email";
import { TRPCError } from "@trpc/server";
import { GraphClient } from "@/server/utils/graphClient";
import { createRBACTestContext } from "@/server/api/utils/rbacTestHelpers";
import { env } from "@/env.mjs";

describe("emailRouter shared mailbox RBAC", () => {
  let callEmail: any;

  beforeEach(() => {
    callEmail = createCallerFactory(emailRouter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should forbid non-admin users from accessing shared mailbox functions", async () => {
    const ctx = createRBACTestContext({ role: "User" });
    const caller = callEmail(ctx);
    await expect(caller.listSharedFolders()).rejects.toBeInstanceOf(TRPCError);
  });

  it("should list shared folders for admin", async () => {
    const folders = [{ id: "f1", displayName: "Inbox" }];
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({
      value: folders,
    });
    const ctx = createRBACTestContext({ role: "Admin" });
    const caller = callEmail(ctx);
    const result = await caller.listSharedFolders();
    expect(result).toEqual(folders);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/mailFolders`
    );
  });

  it("should forbid non-admin users from listing shared messages", async () => {
    const ctx = createRBACTestContext({ role: "User" });
    const caller = callEmail(ctx);
    await expect(
      caller.listSharedMessages({ folderId: "f1", page: 1, pageSize: 10 })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should list shared messages for admin", async () => {
    // Mock GraphClient.get to return messages
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({
      value: [],
      "@odata.nextLink": undefined,
    });
    const ctx = createRBACTestContext({ role: "Admin" });
    const caller = callEmail(ctx);
    const result = await caller.listSharedMessages({
      folderId: "f1",
      page: 1,
      pageSize: 10,
    });
    expect(result).toEqual({ messages: [], nextLink: undefined });
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/mailFolders/f1/messages?$top=10&$skip=0&$orderby=receivedDateTime desc`
    );
  });

  it("should forbid non-admin users from sending shared message", async () => {
    const ctx = createRBACTestContext({ role: "User" });
    const caller = callEmail(ctx);
    await expect(
      caller.sendSharedMessage({
        to: ["a@example.com"],
        cc: [],
        bcc: [],
        subject: "sub",
        htmlBody: "body",
      })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should send message from shared mailbox for admin", async () => {
    vi.spyOn(GraphClient.prototype, "post").mockResolvedValue({
      success: true,
    });
    const ctx = createRBACTestContext({ role: "Admin" });
    const caller = callEmail(ctx);
    const result = await caller.sendSharedMessage({
      to: ["a@example.com"],
      cc: [],
      bcc: [],
      subject: "sub",
      htmlBody: "body",
    });
    expect(result).toEqual({ success: true });
    expect(GraphClient.prototype.post).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/sendMail`,
      expect.objectContaining({
        message: expect.any(Object),
        saveToSentItems: true,
      })
    );
  });
});
