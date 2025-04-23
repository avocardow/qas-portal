import React from "react";

export default function MessageInput() {
  return (
    <div className="border-t p-4">
      {/* TODO: Message input UI */}
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full rounded border bg-white p-2"
      />
    </div>
  );
}
