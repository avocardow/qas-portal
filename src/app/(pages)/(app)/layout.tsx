"use client"; // Keep this - needed for hooks

import React, { ReactNode, useEffect } from "react"; // Import useEffect
import { useSidebar } from "@/context/SidebarContext";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/AppHeader";

// Import NextAuth and Next Navigation hooks
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Optional: Import a loading component
// import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  children: ReactNode;
}

export default function ProtectedAppLayout({ children }: Props) {
  // Renamed for clarity
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  // --- Authentication Check ---
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If status is determined and user is not authenticated, redirect to signin
    if (status === "unauthenticated") {
      router.push("/signin");
    }
    // No need for an 'else' here, if authenticated or loading, we proceed
  }, [status, router]); // Dependency array ensures this runs when status changes

  // --- Loading State ---
  // Show loading indicator while session status is being determined
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* Replace with your actual loading component */}
        {/* <LoadingSpinner /> */}
        <p>Loading...</p>
      </div>
    );
  }

  // --- Authenticated State ---
  // Only render the main layout if authenticated
  if (status === "authenticated") {
    return (
      <div className="min-h-screen lg:flex">
        <AppSidebar />
        <Backdrop />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          {/* Use a main tag for semantic content */}
          <main className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // --- Fallback ---
  // In theory, should only hit this briefly if status is weird or before redirect
  // Can return null or another loading indicator
  return null;
}
