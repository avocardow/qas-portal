"use client";
import React from "react";
import { api } from "@/utils/api";

interface ChatListProps {
  isOpen?: boolean;
  onToggle?: () => void;
  selectedChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

export default function ChatList({
  isOpen = true,
  onToggle = () => {},
  selectedChatId = null,
  onSelectChat = () => {},
}: ChatListProps) {
  const { data, isLoading, isError } = api.chat.listRecent.useQuery();

  return (
    <div className={`p-4 ${isOpen ? "block" : "hidden"} xl:block`}>
      <button className="mb-4 xl:hidden" onClick={onToggle}>
        Close
      </button>
      {isLoading && <p>Loading chats...</p>}
      {isError && <p>Error loading chats.</p>}
      <ul className="space-y-2 overflow-auto">
        {data?.chats.map((chat) => (
          <li
            key={chat.id}
            className={`cursor-pointer p-2 hover:bg-gray-100 ${selectedChatId === chat.id ? "bg-gray-200" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.topic}
          </li>
        ))}
      </ul>
    </div>
  );
}
