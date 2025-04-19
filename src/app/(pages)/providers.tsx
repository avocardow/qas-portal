"use client";

import React from "react";
// import { SessionProvider } from "next-auth/react"; // disabled for testing
import TRPCProvider from "@/app/_trpc/Provider";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // SessionProvider temporarily disabled for testing
    <TRPCProvider>
      <ThemeProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </TRPCProvider>
  );
}
