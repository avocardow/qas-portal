"use client";
export const dynamic = "force-dynamic";
import React from "react";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/AppHeader";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component: static layout without client-only hooks

  return (
    <SessionProvider>
      <ThemeProvider>
        <SidebarProvider>
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
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
