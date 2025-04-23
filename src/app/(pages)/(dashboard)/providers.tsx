"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import TRPCProvider from "@/app/_trpc/Provider";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { RbacProvider } from "@/context/RbacContext";

interface ProvidersProps {
  session: Session | null;
  children: React.ReactNode;
}

export default function Providers({ session, children }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <TRPCProvider>
        <ThemeProvider>
          <SidebarProvider>
            <RbacProvider>{children}</RbacProvider>
          </SidebarProvider>
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
