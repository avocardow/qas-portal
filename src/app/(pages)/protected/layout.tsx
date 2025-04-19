import { ReactNode } from "react";
import AppLayout from "@/app/(app)/layout";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
