"use client";
import React from "react";
import SimpleBar from "simplebar-react";
import { api } from "@/utils/api";

interface EmailListProps {
  folderId: string;
  onSelectMessage?: (messageId: string) => void;
}

export default function EmailList({
  folderId,
  onSelectMessage,
}: EmailListProps) {
  const { data, isLoading, error } = api.email.listMessages.useQuery(
    { folderId, page: 1, pageSize: 20 },
    { enabled: !!folderId }
  );

  if (!folderId) {
    return (
      <div className="p-4 text-gray-500">Select a folder to view messages</div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading messages</div>;
  }

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
        Messages
      </h3>
      <SimpleBar className="custom-scrollbar max-h-[550px] 2xl:max-h-[670px]">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {data!.messages.map((message) => (
            <li
              key={message.id}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/[0.03]"
              onClick={() => onSelectMessage?.(message.id)}
            >
              <div className="flex justify-between">
                <span
                  className={`font-medium ${message.isRead ? "text-gray-500" : "text-gray-800 dark:text-white"}`}
                >
                  {message.subject || "(No Subject)"}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(message.receivedDateTime).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">
                {message.bodyPreview}
              </p>
            </li>
          ))}
        </ul>
      </SimpleBar>
    </div>
  );
}
