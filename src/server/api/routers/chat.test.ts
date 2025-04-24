/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { chatRouter } from "./chat";
import { TRPCError } from "@trpc/server";
import { GraphClient } from "@/server/utils/graphClient";

describe("chatRouter", () => {
  let ctx: any;
  let callChat: any;

  beforeEach(() => {
    callChat = createCallerFactory(chatRouter);
    ctx = { session: { user: { role: "Admin", id: "user1" } } } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list recent chats", async () => {
    const chats = [
      {
        id: "c1",
        topic: "Topic1",
        lastUpdatedDateTime: "2024-01-01T00:00:00Z",
      },
    ];
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({ value: chats });
    const caller = callChat(ctx);
    const result = await caller.listRecent();
    expect(result).toEqual([
      {
        id: "c1",
        topic: "Topic1",
        lastUpdatedDateTime: "2024-01-01T00:00:00Z",
      },
    ]);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/users/${ctx.session.user.id}/chats`
    );
  });

  it("should handle listRecent error", async () => {
    vi.spyOn(GraphClient.prototype, "get").mockRejectedValue(new Error("fail"));
    const caller = callChat(ctx);
    await expect(caller.listRecent()).rejects.toBeInstanceOf(TRPCError);
  });

  it("should get messages for chat", async () => {
    const msgs = [
      {
        id: "m1",
        from: { user: { id: "u1", displayName: "User1" } },
        body: { content: "hello" },
        createdDateTime: "2024-01-01T00:00:00Z",
      },
    ];
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({ value: msgs });
    const caller = callChat(ctx);
    const result = await caller.getMessages({ chatId: "c1" });
    expect(result).toEqual([
      {
        id: "m1",
        content: "hello",
        from: { id: "u1", name: "User1" },
        createdDateTime: "2024-01-01T00:00:00Z",
      },
    ]);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/chats/c1/messages`
    );
  });

  it("should send a message", async () => {
    vi.spyOn(GraphClient.prototype, "post").mockResolvedValue({ id: "m2" });
    const caller = callChat(ctx);
    const result = await caller.sendMessage({ chatId: "c1", content: "test" });
    expect(result).toEqual({ id: "m2" });
    expect(GraphClient.prototype.post).toHaveBeenCalledWith(
      `/chats/c1/messages`,
      { body: { content: "test" } }
    );
  });

  it("should find users", async () => {
    const users = [
      { id: "u1", displayName: "User One", mail: "one@example.com" },
    ];
    const filter = `startswith(displayName,'query') or startswith(mail,'query')`;
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({ value: users });
    const caller = callChat(ctx);
    const result = await caller.findUsers({ query: "query" });
    expect(result).toEqual([
      { id: "u1", name: "User One", email: "one@example.com" },
    ]);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/users?$filter=${encodeURIComponent(filter)}&$top=10`
    );
  });

  it("should create one-to-one chat", async () => {
    vi.spyOn(GraphClient.prototype, "post").mockResolvedValue({ id: "chat1" });
    const caller = callChat(ctx);
    const result = await caller.createOneToOne({ userId: "u1" });
    expect(result).toEqual({ id: "chat1" });
    expect(GraphClient.prototype.post).toHaveBeenCalledWith(`/chats`, {
      chatType: "oneOnOne",
      members: [
        {
          "@odata.type": "#microsoft.graph.aadUserConversationMember",
          roles: ["owner"],
          "user@odata.bind": `https://graph.microsoft.com/v1.0/users/u1`,
        },
      ],
    });
  });

  it("should create group chat", async () => {
    vi.spyOn(GraphClient.prototype, "post").mockResolvedValue({ id: "group1" });
    const caller = callChat(ctx);
    const result = await caller.createGroup({
      userIds: ["u1", "u2"],
      topic: "grp",
    });
    expect(result).toEqual({ id: "group1" });
    const members = [
      {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        roles: ["owner"],
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/u1`,
      },
      {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        roles: ["owner"],
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/u2`,
      },
    ];
    expect(GraphClient.prototype.post).toHaveBeenCalledWith(`/chats`, {
      chatType: "group",
      topic: "grp",
      members,
    });
  });

  it("should list team members", async () => {
    const users = [
      { id: "u1", displayName: "User One", mail: "one@qaspecialists.com.au" },
      { id: "u2", displayName: "User Two", mail: "two@qaspecialists.com.au" },
    ];
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({ value: users });
    const caller = callChat(ctx);
    const result = await caller.listTeamMembers();
    expect(result).toEqual([
      { id: "u1", name: "User One", email: "one@qaspecialists.com.au" },
      { id: "u2", name: "User Two", email: "two@qaspecialists.com.au" },
    ]);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      "/users?$filter=endswith(mail,'@qaspecialists.com.au')&$top=999"
    );
  });
});
