import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EmailService } from "@/server/services/emailService";
import { GraphClient } from "@/server/utils/graphClient";
import { env } from "@/env.mjs";

describe("EmailService", () => {
  let service: EmailService;
  let graphGetMock: vi.SpyInstance;
  let graphPostMock: vi.SpyInstance;

  beforeEach(() => {
    graphGetMock = vi.spyOn(GraphClient.prototype, "get");
    graphPostMock = vi.spyOn(GraphClient.prototype, "post");
    service = new EmailService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listFolders should return an array of MailFolder", async () => {
    const folders = [{ id: "1", displayName: "Inbox" }];
    graphGetMock.mockResolvedValue({ value: folders });
    const result = await service.listFolders();
    expect(graphGetMock).toHaveBeenCalledWith(
      `/users/${env.EMAIL_FROM}/mailFolders`
    );
    expect(result).toEqual(folders);
  });

  it("listMessages should return messages and nextLink", async () => {
    const messages = [
      {
        id: "m1",
        subject: "Test",
        bodyPreview: "Preview",
        from: { emailAddress: { name: "A", address: "a@b.com" } },
        toRecipients: [],
        receivedDateTime: "2020-01-01T00:00:00Z",
        isRead: false,
      },
    ];
    const nextLink = "someLink";
    graphGetMock.mockResolvedValue({
      value: messages,
      "@odata.nextLink": nextLink,
    });
    const result = await service.listMessages("folder1", 2, 10);
    expect(graphGetMock).toHaveBeenCalledWith(
      `/users/${env.EMAIL_FROM}/mailFolders/folder1/messages?$top=10&$skip=10&$orderby=receivedDateTime desc`
    );
    expect(result).toEqual({ messages, nextLink });
  });

  it("getMessage should return the full message", async () => {
    const message = { id: "m1", body: "<p>Hi</p>" };
    graphGetMock.mockResolvedValue(message);
    const result = await service.getMessage("m1");
    expect(graphGetMock).toHaveBeenCalledWith(
      `/users/${env.EMAIL_FROM}/messages/m1?$expand=attachments`
    );
    expect(result).toEqual(message);
  });

  it("sendMessage should post the correct payload", async () => {
    graphPostMock.mockResolvedValue(undefined);
    await service.sendMessage(
      ["t@b.com"],
      ["c@b.com"],
      ["b@b.com"],
      "Subject",
      "<p>Body</p>"
    );
    expect(graphPostMock).toHaveBeenCalledWith(
      `/users/${env.EMAIL_FROM}/sendMail`,
      {
        message: {
          subject: "Subject",
          body: { contentType: "HTML", content: "<p>Body</p>" },
          toRecipients: [{ emailAddress: { address: "t@b.com" } }],
          ccRecipients: [{ emailAddress: { address: "c@b.com" } }],
          bccRecipients: [{ emailAddress: { address: "b@b.com" } }],
        },
        saveToSentItems: true,
      }
    );
  });

  it("createReply should return the draftMessageId", async () => {
    graphPostMock.mockResolvedValue({ id: "d1" });
    const result = await service.createReply("m1", "comment");
    expect(graphPostMock).toHaveBeenCalledWith(
      `/users/${env.EMAIL_FROM}/messages/m1/createReply`,
      { comment: "comment" }
    );
    expect(result).toEqual({ draftMessageId: "d1" });
  });

  it("createForward should return the draftMessageId", async () => {
    graphPostMock.mockResolvedValue({ id: "d2" });
    const result = await service.createForward("m1", "comment", ["f@b.com"]);
    expect(graphPostMock).toHaveBeenCalledWith(
      `/users/${env.EMAIL_FROM}/messages/m1/createForward`,
      {
        comment: "comment",
        toRecipients: [{ emailAddress: { address: "f@b.com" } }],
      }
    );
    expect(result).toEqual({ draftMessageId: "d2" });
  });
});
