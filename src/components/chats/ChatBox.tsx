import React from "react";
import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxSendForm from "./ChatBoxSendForm";
import Image from "next/image";

interface ChatItem {
  id: number;
  name: string;
  role: string;
  profileImage: string;
  status: "online" | "offline";
  lastActive: string;
  message: string;
  isSender: boolean;
  imagePreview?: string;
}

const chatList: ChatItem[] = [
  {
    id: 1,
    name: "Kaiya George",
    role: "Project Manager",
    profileImage: "/images/user/user-18.jpg",
    status: "online",
    lastActive: "15 mins",
    message: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
    isSender: false,
  },
  {
    id: 2,
    name: "Lindsey Curtis",
    role: "Designer",
    profileImage: "/images/user/user-17.jpg",
    status: "online",
    lastActive: "30 mins",
    message: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
    isSender: false,
  },
  {
    id: 3,
    name: "You",
    role: "",
    profileImage: "",
    status: "online",
    lastActive: "2 hours ago",
    message: "If don’t like something, I’ll stay away from it.",
    isSender: true,
  },
  {
    id: 4,
    name: "Lindsey Curtis",
    role: "Designer",
    profileImage: "/images/user/user-17.jpg",
    status: "online",
    lastActive: "2 hours ago",
    message: "I want more detailed information.",
    isSender: false,
  },
  {
    id: 5,
    name: "You",
    role: "",
    profileImage: "",
    status: "online",
    lastActive: "2 hours ago",
    message: "They got there early, and got really good seats.",
    isSender: true,
  },
  {
    id: 6,
    name: "Lindsey Curtis",
    role: "Designer",
    profileImage: "/images/user/user-17.jpg",
    status: "online",
    lastActive: "2 hours ago",
    message: "Please preview the image",
    isSender: false,
    imagePreview: "/images/chat/chat.jpg",
  },
];

export default function ChatBox() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white xl:w-3/4 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* <!-- ====== Chat Box Start --> */}
      <ChatBoxHeader />
      <div className="custom-scrollbar max-h-full flex-1 space-y-6 overflow-auto p-5 xl:space-y-8 xl:p-6">
        {chatList.map((chat) => (
          <div
            key={chat.id}
            className={`flex ${
              chat.isSender ? "justify-end" : "items-start gap-4"
            }`}
          >
            {!chat.isSender && (
              <div className="size-10 overflow-hidden rounded-full">
                <Image
                  width={40}
                  height={40}
                  src={chat.profileImage}
                  alt={`${chat.name} profile`}
                  className="size-full object-cover object-center"
                />
              </div>
            )}

            <div className={`${chat.isSender ? "text-right" : ""}`}>
              {chat.imagePreview && (
                <div className="mb-2 w-full max-w-[270px] overflow-hidden rounded-lg">
                  <Image
                    width={270}
                    height={150}
                    src={chat.imagePreview}
                    alt="chat"
                    className="w-full object-cover"
                  />
                </div>
              )}

              <div
                className={`rounded-lg px-3 py-2 ${
                  chat.isSender
                    ? "bg-brand-500 dark:bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/90"
                } ${chat.isSender ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              >
                <p className="text-sm">{chat.message}</p>
              </div>
              <p className="text-theme-xs mt-2 text-gray-500 dark:text-gray-400">
                {chat.isSender
                  ? chat.lastActive
                  : `${chat.name}, ${chat.lastActive}`}
              </p>
            </div>
          </div>
        ))}
      </div>
      <ChatBoxSendForm />
      {/* <!-- ====== Chat Box End --> */}
    </div>
  );
}
