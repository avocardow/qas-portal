"use client";

import React from "react";
// Import SessionProvider
import { SessionProvider } from "next-auth/react";
import TRPCProvider from "@/app/_trpc/Provider"; // Assuming this is your tRPC Provider setup
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
// Add RbacProvider import
import { RbacProvider } from "@/context/RbacContext";
import { PermissionProvider } from '@/contexts/PermissionContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <PermissionProvider>
          <ThemeProvider>
            <SidebarProvider>
              <RbacProvider>
                {children}
              </RbacProvider>
            </SidebarProvider>
          </ThemeProvider>
        </PermissionProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
