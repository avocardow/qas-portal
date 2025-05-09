"use client";
import Image from "next/image";
// Removed Link import
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
// Import next-auth hooks
import { useSession, signOut } from "next-auth/react";
// Removed Skeleton import

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  // Get session data
  const { data: session, status } = useSession(); // Still need status to check for authenticated

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Sign out handler function
  const handleSignOut = () => {
    closeDropdown(); // Close dropdown first
    signOut({ callbackUrl: "/signin" }); // Sign out and redirect to signin page
  };

  // Handle unauthenticated state or initial loading without skeletons
  // Render null if not authenticated to avoid errors trying to access session.user
  if (status !== "authenticated" || !session?.user) {
    return null; // Or potentially a Sign In button if appropriate for the location
  }

  // --- Render dropdown when authenticated ---
  const user = session.user;
  const userImage = user.image; // Use user's image URL if available
  const userName = user.name ?? user.email?.split("@")[0] ?? "User";
  const userEmail = user.email ?? "No email provided";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
        aria-label="Open user menu"
        aria-expanded={isOpen}
      >
        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
          {userImage && !imgError ? (
            <Image
              width={44}
              height={44}
              src={userImage}
              alt="User Avatar"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
              <svg
                className="absolute -left-1 h-12 w-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                />
              </svg>
            </div>
          )}
        </span>
        <span className="text-theme-sm mr-1 block font-medium">{userName}</span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/*
-      {false && (<Dropdown
-        isOpen={isOpen}
-        onClose={closeDropdown}
-        className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800"
-      >
-        <div>
-          <span className="text-theme-sm block truncate font-medium text-gray-700 dark:text-gray-400">
-            {user.name ?? "User Name"}
-          </span>
-          <span className="text-theme-xs mt-0.5 block truncate text-gray-500 dark:text-gray-400">
-            {userEmail}
-          </span>
-        </div>
-
-        <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
-          <li>...profile/settings/support items...</li>
-        </ul>
-        <DropdownItem
-          tag="button"
-          onItemClick={handleSignOut}
-          className="text-theme-sm group mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
-        >
-          {/* Sign Out Icon SVG *-/}
-          Sign out
-        </DropdownItem>
-      </Dropdown>)}
      */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800"
      >
        {/* User name and email */}
        <div>
          <span className="text-theme-sm block truncate font-medium text-gray-700 dark:text-gray-400">
            {userName}
          </span>
          <span className="text-theme-xs mt-0.5 block truncate text-gray-500 dark:text-gray-400">
            {userEmail}
          </span>
        </div>
        <DropdownItem
          tag="button"
          onItemClick={handleSignOut}
          className="text-theme-sm group mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          {/* Sign Out Icon SVG */}
          Sign out
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
