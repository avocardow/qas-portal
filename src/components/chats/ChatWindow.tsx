import React, { useEffect, useRef } from "react";

interface ChatWindowProps {
  messages: {
    id: string;
    content: string;
    from: { id: string; name: string };
    createdDateTime: string;
  }[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-auto p-4">
      <ul className="space-y-4">
        {messages.map((msg) => (
          <li key={msg.id}>
            <p className="text-sm text-gray-600">
              {msg.from.name} -{" "}
              {new Date(msg.createdDateTime).toLocaleTimeString()}
            </p>
            <p className="rounded bg-gray-100 p-2">{msg.content}</p>
          </li>
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
