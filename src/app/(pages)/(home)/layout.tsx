import { ReactNode } from "react";
// import { requireAuth } from "@/lib/auth"; // auth temporarily disabled for testing
import AdminLayout from "@/app/(admin)/layout";

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  // requireAuth(); // bypass auth temporarily for testing
  return <AdminLayout>{children}</AdminLayout>;
}
