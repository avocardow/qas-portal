"use client";
import React, { useState } from "react";
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
  const utils = api.useContext();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchError,
  } = api.chat.findUsers.useQuery(
    { query: searchTerm },
    { enabled: isCreatingChat && searchTerm.length > 0 }
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupTopic, setGroupTopic] = useState("");
  const createOneToOneMutation = api.chat.createOneToOne.useMutation({
    onSuccess: (data) => {
      utils.chat.listRecent.invalidate();
      setIsCreatingChat(false);
      setSearchTerm("");
      setSelectedUserIds([]);
      onSelectChat(data.id);
    },
  });
  const createGroupMutation = api.chat.createGroup.useMutation({
    onSuccess: (data) => {
      utils.chat.listRecent.invalidate();
      setIsCreatingChat(false);
      setSearchTerm("");
      setSelectedUserIds([]);
      setGroupTopic("");
      onSelectChat(data.id);
    },
  });
  const { data, isLoading, isError } = api.chat.listRecent.useQuery();

  return (
    <div className={`p-4 ${isOpen ? "block" : "hidden"} xl:block`}>
      <button className="mb-4 xl:hidden" onClick={onToggle}>
        Close
      </button>
      {!isCreatingChat ? (
        <>
          <button
            className="mb-4 text-blue-500"
            onClick={() => setIsCreatingChat(true)}
          >
            New Chat
          </button>
          {isLoading && <p>Loading chats...</p>}
          {isError && <p>Error loading chats.</p>}
          <ul className="space-y-2 overflow-auto">
            {data?.chats.map((chat) => (
              <li
                key={chat.id}
                className={`cursor-pointer p-2 hover:bg-gray-100 ${
                  selectedChatId === chat.id ? "bg-gray-200" : ""
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                {chat.topic}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button
            className="mb-4 text-red-500"
            onClick={() => setIsCreatingChat(false)}
          >
            Cancel
          </button>
          <input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2 w-full border p-2"
          />
          {searchLoading ? (
            <p>Searching users...</p>
          ) : searchError ? (
            <p>Error searching users.</p>
          ) : (
            <ul className="mb-2 space-y-2 overflow-auto">
              {searchResults?.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100"
                >
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => {
                      if (selectedUserIds.includes(user.id)) {
                        setSelectedUserIds(
                          selectedUserIds.filter((id) => id !== user.id)
                        );
                      } else {
                        setSelectedUserIds([...selectedUserIds, user.id]);
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          {selectedUserIds.length === 1 && (
            <>
              {createOneToOneMutation.status === "error" && (
                <p>Error creating chat.</p>
              )}
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white"
                disabled={createOneToOneMutation.status === "pending"}
                onClick={() =>
                  createOneToOneMutation.mutate({ userId: selectedUserIds[0] })
                }
              >
                {createOneToOneMutation.status === "pending"
                  ? "Starting Chat..."
                  : "Start Chat"}
              </button>
            </>
          )}
          {selectedUserIds.length > 1 && (
            <>
              <input
                type="text"
                placeholder="Group topic"
                value={groupTopic}
                onChange={(e) => setGroupTopic(e.target.value)}
                className="mb-2 w-full border p-2"
              />
              {createGroupMutation.status === "error" && (
                <p>Error creating group chat.</p>
              )}
              <button
                className="rounded bg-green-500 px-4 py-2 text-white"
                disabled={
                  !groupTopic || createGroupMutation.status === "pending"
                }
                onClick={() =>
                  createGroupMutation.mutate({
                    userIds: selectedUserIds,
                    topic: groupTopic,
                  })
                }
              >
                {createGroupMutation.status === "pending"
                  ? "Creating Group Chat..."
                  : "Create Group Chat"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
