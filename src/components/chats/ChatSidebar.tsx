"use client";
import ChatList from "./ChatList";
import ChatHeader from "./ChatHeader";
import { useState } from "react";

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      {isOpen && (
        <div
          className="z-999999 fixed inset-0 bg-gray-900/50 transition-all duration-300"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-col rounded-2xl border border-gray-200 bg-white xl:flex xl:w-1/4 dark:border-gray-800 dark:bg-white/[0.03]">
        <ChatHeader onToggle={toggleSidebar} />
        <ChatList isOpen={isOpen} onToggle={toggleSidebar} />
      </div>
    </>
  );
}
