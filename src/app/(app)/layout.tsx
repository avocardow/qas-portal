import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Props) {
  await requireAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 p-4 text-white">
        <h2 className="mb-4 text-xl font-bold">Sidebar</h2>
      </aside>
      <div className="flex-1 bg-white p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </header>
        {children}
      </div>
    </div>
  );
}
