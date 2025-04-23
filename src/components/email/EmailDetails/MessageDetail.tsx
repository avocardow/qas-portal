"use client";
import React from "react";
import DOMPurify from "dompurify";
import { api } from "@/utils/api";
import EmailDetailsBottom from "./EmailDetailsBottom";

// Props for MessageDetail component
export interface MessageDetailProps {
  messageId: string;
}

// Data shape for detailed message
interface MessageDetailData {
  body: { content: string };
  from: { emailAddress: { name: string; address: string } };
  subject: string;
  receivedDateTime: string;
  attachments?: { id: string; name: string; contentUrl?: string }[];
}

// Create a component that fetches and displays the full email content and attachments
export default function MessageDetail({ messageId }: MessageDetailProps) {
  const { data, isLoading, error } = api.email.getMessage.useQuery(
    { messageId },
    { enabled: Boolean(messageId) }
  );

  if (!messageId) {
    return (
      <div className="p-4 text-gray-500">Select a message to view details</div>
    );
  }
  if (isLoading) {
    return <div className="p-4">Loading message...</div>;
  }
  if (error || !data) {
    return <div className="p-4 text-red-500">Error loading message</div>;
  }

  // Cast data to our typed interface
  const message = data as MessageDetailData;
  const sanitizedHtml = DOMPurify.sanitize(message.body.content ?? "");

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white xl:h-full dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-4">
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-white">
            {message.from.emailAddress.name}
          </span>{" "}
          &lt;{message.from.emailAddress.address}&gt;
        </div>
        <div className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {message.subject}
        </div>
        <div className="mb-4 text-xs text-gray-400 dark:text-gray-500">
          {new Date(message.receivedDateTime).toLocaleString()}
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert p-4">
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>

      {message.attachments?.length ? (
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-white">
            Attachments
          </h4>
          <ul className="space-y-2">
            {message.attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={att.contentUrl}
                  download={att.name}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {att.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <EmailDetailsBottom messageId={messageId} />
    </div>
  );
}
