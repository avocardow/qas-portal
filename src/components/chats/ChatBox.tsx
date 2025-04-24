import React, { useState } from "react";
import ChatBoxHeader from "./ChatBoxHeader";
import { api } from "@/utils/api";

interface ChatBoxProps {
  selectedChatId?: string | null;
}

export default function ChatBox({ selectedChatId }: ChatBoxProps) {
  const utils = api.useContext();
  const {
    data: messages,
    isLoading: loadingMessages,
    isError,
  } = api.chat.getMessages.useQuery(
    { chatId: selectedChatId! },
    { enabled: !!selectedChatId }
  );
  const [messageContent, setMessageContent] = useState("");
  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.getMessages.invalidate();
      setMessageContent("");
    },
  });

  if (!selectedChatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Select a chat to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white xl:w-3/4 dark:border-gray-800 dark:bg-white/[0.03]">
      <ChatBoxHeader />
      <div className="flex-1 space-y-4 overflow-auto p-5">
        {loadingMessages && <p>Loading messages...</p>}
        {isError && <p>Error loading messages.</p>}
        {messages?.map((msg) => (
          <div key={msg.id} className="mb-4">
            <p>
              <strong>{msg.from.name}:</strong> {msg.content}
            </p>
            <p className="text-xs text-gray-500">{msg.createdDateTime}</p>
          </div>
        ))}
      </div>
      <form
        className="flex border-t p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (messageContent) {
            sendMessage.mutate({
              chatId: selectedChatId,
              content: messageContent,
            });
          }
        }}
      >
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded border p-2"
        />
        <button
          type="submit"
          disabled={!messageContent || sendMessage.isLoading}
          className="ml-2 rounded bg-blue-500 p-2 text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
}
