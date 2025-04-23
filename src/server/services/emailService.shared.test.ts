import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EmailService } from "@/server/services/emailService";
import { GraphClient } from "@/server/utils/graphClient";
import { env } from "@/env.mjs";

describe("EmailService Shared Mailbox", () => {
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

  it("listFoldersForMailbox should return an array of MailFolder for shared mailbox", async () => {
    const folders = [{ id: "sf1", displayName: "SharedInbox" }];
    graphGetMock.mockResolvedValue({ value: folders });
    const result = await service.listFoldersForMailbox(
      env.SHARED_MAILBOX_EMAIL
    );
    expect(graphGetMock).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/mailFolders`
    );
    expect(result).toEqual(folders);
  });

  it("listMessagesForMailbox should return messages and nextLink for shared mailbox", async () => {
    const messages = [
      {
        id: "sm1",
        subject: "SharedTest",
        bodyPreview: "SharedPreview",
        from: { emailAddress: { name: "S", address: "s@b.com" } },
        toRecipients: [],
        receivedDateTime: "2021-01-01T00:00:00Z",
        isRead: true,
      },
    ];
    const nextLink = "sharedLink";
    graphGetMock.mockResolvedValue({
      value: messages,
      "@odata.nextLink": nextLink,
    });
    const result = await service.listMessagesForMailbox(
      env.SHARED_MAILBOX_EMAIL,
      "sf1",
      3,
      5
    );
    expect(graphGetMock).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/mailFolders/sf1/messages?$top=5&$skip=10&$orderby=receivedDateTime desc`
    );
    expect(result).toEqual({ messages, nextLink });
  });

  it("getMessageForMailbox should return the full message for shared mailbox", async () => {
    const message = { id: "sm1", body: { content: "<p>SharedHi</p>" } };
    graphGetMock.mockResolvedValue(message);
    const result = await service.getMessageForMailbox(
      env.SHARED_MAILBOX_EMAIL,
      "sm1"
    );
    expect(graphGetMock).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/messages/sm1?$expand=attachments`
    );
    expect(result).toEqual(message);
  });

  it("sendMessageFromMailbox should post the correct payload for shared mailbox", async () => {
    graphPostMock.mockResolvedValue(undefined);
    await service.sendMessageFromMailbox(
      env.SHARED_MAILBOX_EMAIL,
      ["a@b.com"],
      ["c@b.com"],
      ["d@b.com"],
      "SharedSubject",
      "<p>SharedBody</p>"
    );
    expect(graphPostMock).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/sendMail`,
      {
        message: {
          subject: "SharedSubject",
          body: { contentType: "HTML", content: "<p>SharedBody</p>" },
          toRecipients: [{ emailAddress: { address: "a@b.com" } }],
          ccRecipients: [{ emailAddress: { address: "c@b.com" } }],
          bccRecipients: [{ emailAddress: { address: "d@b.com" } }],
        },
        saveToSentItems: true,
      }
    );
  });

  it("createReplyFromMailbox should return the draftMessageId for shared mailbox", async () => {
    graphPostMock.mockResolvedValue({ id: "sd1" });
    const result = await service.createReplyFromMailbox(
      env.SHARED_MAILBOX_EMAIL,
      "sm1",
      "sharedComment"
    );
    expect(graphPostMock).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/messages/sm1/createReply`,
      { comment: "sharedComment" }
    );
    expect(result).toEqual({ draftMessageId: "sd1" });
  });

  it("createForwardFromMailbox should return the draftMessageId for shared mailbox", async () => {
    graphPostMock.mockResolvedValue({ id: "sd2" });
    const result = await service.createForwardFromMailbox(
      env.SHARED_MAILBOX_EMAIL,
      "sm1",
      "sharedComment",
      ["f@b.com"]
    );
    expect(graphPostMock).toHaveBeenCalledWith(
      `/users/${env.SHARED_MAILBOX_EMAIL}/messages/sm1/createForward`,
      {
        comment: "sharedComment",
        toRecipients: [{ emailAddress: { address: "f@b.com" } }],
      }
    );
    expect(result).toEqual({ draftMessageId: "sd2" });
  });
});
