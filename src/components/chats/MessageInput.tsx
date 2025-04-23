import React, { useState, FormEvent } from "react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export default function MessageInput({
  onSendMessage,
  isLoading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={isLoading}
        className="flex-1 rounded border bg-white p-2 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
