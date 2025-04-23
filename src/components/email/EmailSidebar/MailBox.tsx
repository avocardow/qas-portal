"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";

export default function MailBox({
  onSelect,
  mailboxType = "personal",
}: {
  onSelect: (folderId: string) => void;
  mailboxType?: "personal" | "shared";
}) {
  const [activeItem, setActiveItem] = useState<string>("");
  const query =
    mailboxType === "shared"
      ? api.email.listSharedFolders.useQuery()
      : api.email.listFolders.useQuery();
  const { data: folders, isLoading, error } = query;

  useEffect(() => {
    if (folders && folders.length > 0 && !activeItem) {
      setActiveItem(folders[0].id);
      onSelect(folders[0].id);
    }
  }, [folders, activeItem, onSelect]);

  if (isLoading) {
    return <div>Loading folders...</div>;
  }

  if (error) {
    return <div>Error loading folders</div>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {folders!.map((folder) => (
        <li key={folder.id}>
          <button
            onClick={() => {
              setActiveItem(folder.id);
              onSelect(folder.id);
            }}
            className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
              activeItem === folder.id
                ? "text-brand-500 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/[0.12]"
                : "text-gray-500 dark:text-gray-400"
            } hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-500/[0.12] dark:hover:text-gray-400`}
          >
            <span className="flex items-center gap-3">
              {folder.displayName}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
