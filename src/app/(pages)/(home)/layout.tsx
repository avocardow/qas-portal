import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import AdminLayout from "@/app/(admin)/layout";

interface Props {
  children: ReactNode;
}

export default async function AppLayout({ children }: Props) {
  await requireAuth();
  return <AdminLayout>{children}</AdminLayout>;
}
