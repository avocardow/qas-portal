// src/app/providers.tsx (or similar path)
"use client";

import React from "react";
// Import SessionProvider
import { SessionProvider } from "next-auth/react";
import TRPCProvider from "@/app/_trpc/Provider"; // Assuming this is your tRPC Provider setup
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Wrap everything with SessionProvider at the top level
    <SessionProvider>
      <TRPCProvider>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
