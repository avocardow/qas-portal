import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import AdminLayout from "@/app/(admin)/layout";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/signin");
  }
  return <AdminLayout>{children}</AdminLayout>;
}
