"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const sidebarOpen = isExpanded || isHovered || isMobileOpen;

  return (
    <div
      className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarOpen
          ? "lg:ml-[290px] lg:max-w-[calc(100%-290px)]"
          : "lg:ml-[90px] lg:max-w-[calc(100%-90px)]"
      }`}
    >
      {children}
    </div>
  );
}
