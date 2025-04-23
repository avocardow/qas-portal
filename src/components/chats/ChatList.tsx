import React from "react";

interface ChatListProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatList({ isOpen, onToggle }: ChatListProps) {
  return (
    <div className={`p-4 ${isOpen ? "block" : "hidden"} xl:block`}>
      <button className="mb-4 xl:hidden" onClick={onToggle}>
        Close
      </button>
      {/* TODO: Chat list UI */}
      <p>Chat List Placeholder</p>
    </div>
  );
}
