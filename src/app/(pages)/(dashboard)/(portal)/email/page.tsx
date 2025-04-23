"use client";
import React, { useState } from "react";
import EmailSidebar from "@/components/email/EmailSidebar/EmailSidebar";
import EmailList from "@/components/email/EmailList/EmailList";
import MessageDetail from "@/components/email/EmailDetails/MessageDetail";

export default function EmailPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<string>("");
  const [mailboxType, setMailboxType] = useState<"personal" | "shared">(
    "personal"
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <EmailSidebar
        onSelect={setSelectedFolder}
        onMailboxTypeChange={setMailboxType}
      />
      <EmailList
        folderId={selectedFolder}
        mailboxType={mailboxType}
        onSelectMessage={setSelectedMessage}
      />
      {selectedMessage ? (
        <MessageDetail messageId={selectedMessage} mailboxType={mailboxType} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">
            Select a message to view details.
          </p>
        </div>
      )}
    </div>
  );
}
