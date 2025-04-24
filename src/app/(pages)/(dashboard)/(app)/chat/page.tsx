import React, { useState } from "react";
import ChatSidebar from "@/components/chats/ChatSidebar";
import ChatBox from "@/components/chats/ChatBox";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Chats | TailAdmin - Next.js Dashboard Template",
  description:
    "Chats page within the Dashboard section modeled after TailAdmin template",
};

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  return (
    <div>
      <PageBreadcrumb pageTitle="Chats" />
      <div className="h-[calc(100vh-150px)] overflow-hidden sm:h-[calc(100vh-174px)]">
        <div className="flex h-full flex-col gap-6 xl:flex-row xl:gap-5">
          {/* Chat Sidebar Start */}
          <ChatSidebar
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
          {/* Chat Sidebar End */}
          {/* Chat Box Start */}
          <ChatBox selectedChatId={selectedChatId} />
          {/* Chat Box End */}
        </div>
      </div>
    </div>
  );
}
