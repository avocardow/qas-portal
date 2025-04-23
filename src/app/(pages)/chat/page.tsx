import AuthLayout from "@/app/(pages)/(auth)/layout";
import ChatList from "@/components/chats/ChatList";
import ChatWindow from "@/components/chats/ChatWindow";
import MessageInput from "@/components/chats/MessageInput";

export default function ChatPage() {
  return (
    <AuthLayout>
      <div className="flex h-full">
        <aside className="w-1/3 border-r">
          <ChatList />
        </aside>
        <main className="flex flex-1 flex-col">
          <ChatWindow />
          <MessageInput />
        </main>
      </div>
    </AuthLayout>
  );
}
