import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import Providers from "./providers";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/AppHeader";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }
  return (
    <Providers session={session}>
      <div className="min-h-screen lg:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </Providers>
  );
}
