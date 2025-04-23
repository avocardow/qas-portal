"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import ChatList from "@/components/chats/ChatList";
import ChatWindow from "@/components/chats/ChatWindow";
import MessageInput from "@/components/chats/MessageInput";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError,
  } = api.chat.getMessages.useQuery(
    { chatId: selectedChatId! },
    { enabled: !!selectedChatId }
  );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        api.chat.getMessages.getQueryKey({ chatId: selectedChatId! })
      );
    },
  });

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return;
    sendMessageMutation.mutate({ chatId: selectedChatId, content });
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <ChatList
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>
      <div className="flex w-3/4 flex-col">
        {!selectedChatId ? (
          <div className="flex flex-1 items-center justify-center">
            <p>Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <p>Loading messages...</p>
              ) : messagesError ? (
                <p>Error loading messages</p>
              ) : (
                <ChatWindow messages={messages || []} />
              )}
            </div>
            <div className="border-t p-4">
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={sendMessageMutation.isLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
