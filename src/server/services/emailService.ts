import { GraphClient } from "@/server/utils/graphClient";
import { env } from "@/env.mjs";

/** A minimal representation of a mail folder in Microsoft Graph */
export interface MailFolder {
  id: string;
  displayName: string;
  [key: string]: unknown;
}

/** A minimal representation of an email message in Microsoft Graph */
export interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients: Array<{ emailAddress: { name: string; address: string } }>;
  receivedDateTime: string;
  isRead: boolean;
  [key: string]: unknown;
}

/**
 * EmailService provides methods to interact with Microsoft Graph email endpoints.
 */
export class EmailService {
  private graph: GraphClient;
  private readonly userEmail: string;

  constructor() {
    this.graph = new GraphClient();
    this.userEmail = env.EMAIL_FROM;
  }

  /** List mail folders for the user */
  async listFolders(): Promise<MailFolder[]> {
    const result = await this.graph.get<{ value: MailFolder[] }>(
      `/users/${this.userEmail}/mailFolders`
    );
    return result.value;
  }

  /**
   * List messages in a folder with pagination
   * @param folderId - The ID of the mail folder
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   */
  async listMessages(
    folderId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ messages: EmailMessage[]; nextLink?: string }> {
    const skip = (page - 1) * pageSize;
    const result = await this.graph.get<{
      value: EmailMessage[];
      "@odata.nextLink"?: string;
    }>(
      `/users/${this.userEmail}/mailFolders/${folderId}/messages?$top=${pageSize}&$skip=${skip}&$orderby=receivedDateTime desc`
    );
    return {
      messages: result.value,
      nextLink: result["@odata.nextLink"],
    };
  }

  /**
   * Get full message details including body and attachments
   * @param messageId - The ID of the message
   */
  async getMessage(messageId: string): Promise<unknown> {
    const result = await this.graph.get<unknown>(
      `/users/${this.userEmail}/messages/${messageId}?$expand=attachments`
    );
    // TODO: sanitize HTML body in result if needed
    return result;
  }

  /**
   * Send a new message
   * @param to - Array of recipient email addresses
   * @param cc - Array of CC email addresses
   * @param bcc - Array of BCC email addresses
   * @param subject - Email subject
   * @param htmlBody - Email body in HTML
   */
  async sendMessage(
    to: string[],
    cc: string[] = [],
    bcc: string[] = [],
    subject: string,
    htmlBody: string
  ): Promise<void> {
    const message = {
      subject,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: to.map((address) => ({ emailAddress: { address } })),
      ccRecipients: cc.map((address) => ({ emailAddress: { address } })),
      bccRecipients: bcc.map((address) => ({ emailAddress: { address } })),
    };
    await this.graph.post<void>(`/users/${this.userEmail}/sendMail`, {
      message,
      saveToSentItems: true,
    });
  }

  /**
   * Create a reply draft for a message
   * @param messageId - The ID of the message to reply to
   * @param comment - Optional comment to include in the reply
   */
  async createReply(
    messageId: string,
    comment: string = ""
  ): Promise<{ draftMessageId: string }> {
    const draft = await this.graph.post<{ id: string }>(
      `/users/${this.userEmail}/messages/${messageId}/createReply`,
      { comment }
    );
    return { draftMessageId: draft.id };
  }

  /**
   * Create a forward draft for a message
   * @param messageId - The ID of the message to forward
   * @param comment - Optional comment to include in the forward
   * @param to - Array of recipient email addresses for forwarding
   */
  async createForward(
    messageId: string,
    comment: string,
    to: string[]
  ): Promise<{ draftMessageId: string }> {
    const draft = await this.graph.post<{ id: string }>(
      `/users/${this.userEmail}/messages/${messageId}/createForward`,
      {
        comment,
        toRecipients: to.map((address) => ({ emailAddress: { address } })),
      }
    );
    return { draftMessageId: draft.id };
  }
}
