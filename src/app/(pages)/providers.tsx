"use client";

import React from "react";
// Import SessionProvider
import { SessionProvider } from "next-auth/react";
import TRPCProvider from "@/app/_trpc/Provider"; // Assuming this is your tRPC Provider setup
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ToastProvider } from "@/context/ToastContext";
// Add RbacProvider import
import { PermissionProvider } from '@/contexts/PermissionContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ImpersonationProvider>
          <PermissionProvider>
            <ThemeProvider>
              <SidebarProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </SidebarProvider>
            </ThemeProvider>
          </PermissionProvider>
        </ImpersonationProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
