"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { HorizontaLDots } from "../icons/index";
import { NAV_PERMISSIONS, type NavPermission } from "@/constants/permissions";
import Authorized from "@/components/Authorized";

// import SidebarWidget from "./SidebarWidget";

// Define only Team and Client page links
const teamPages: { name: string; path: string }[] = [
  { name: "Email", path: "/email" },
  { name: "Tasks", path: "/tasks" },
  { name: "Settings", path: "/settings" },
  { name: "Account", path: "/account" },
  { name: "Phone", path: "/phone" },
  { name: "Invoices", path: "/invoices" },
  { name: "Files", path: "/files" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Clients", path: "/clients" },
  { name: "Contacts", path: "/contacts" },
  { name: "Chat", path: "/chat" },
  { name: "Calendar", path: "/calendar" },
  { name: "Audits", path: "/audits" },
];
const clientPages: { name: string; path: string }[] = [
  { name: "Documents", path: "/documents" },
  { name: "Profile", path: "/profile" },
  { name: "Home", path: "/home" },
  { name: "Billing", path: "/billing" },
];

// Define required permissions for navigation menu items
const navPermissionMap: Record<string, NavPermission> = {
  "/email": NAV_PERMISSIONS.TEAM_EMAIL,
  "/tasks": NAV_PERMISSIONS.TEAM_TASKS,
  "/settings": NAV_PERMISSIONS.TEAM_SETTINGS,
  "/account": NAV_PERMISSIONS.TEAM_ACCOUNT,
  "/phone": NAV_PERMISSIONS.TEAM_PHONE,
  "/invoices": NAV_PERMISSIONS.TEAM_INVOICES,
  "/files": NAV_PERMISSIONS.TEAM_FILES,
  "/dashboard": NAV_PERMISSIONS.TEAM_DASHBOARD,
  "/clients": NAV_PERMISSIONS.TEAM_CLIENTS,
  "/contacts": NAV_PERMISSIONS.TEAM_CONTACTS,
  "/chat": NAV_PERMISSIONS.TEAM_CHAT,
  "/calendar": NAV_PERMISSIONS.TEAM_CALENDAR,
  "/audits": NAV_PERMISSIONS.TEAM_AUDITS,
  "/documents": NAV_PERMISSIONS.CLIENT_DOCUMENTS,
  "/profile": NAV_PERMISSIONS.CLIENT_PROFILE,
  "/home": NAV_PERMISSIONS.CLIENT_HOME,
  "/billing": NAV_PERMISSIONS.CLIENT_BILLING,
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const isActive = useCallback(
    (path: string) =>
      pathname === path ||
      pathname.startsWith(path + "/"),
    [pathname]
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-full flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/clients">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Team Pages Group */}
            <div>
              <Authorized action={NAV_PERMISSIONS.PAGE_HEADINGS} fallback={null}>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Team Pages"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              </Authorized>
              <ul className="flex flex-col gap-4">
                {teamPages.map((page) => {
                  const permission = navPermissionMap[page.path];
                  const navItem = (
                    <li key={page.name} data-testid={`nav-item-${page.name.toLowerCase()}`}>
                      <Link
                        href={page.path}
                        className={`menu-item group ${
                          isActive(page.path)
                            ? "menu-item-active"
                            : "menu-item-inactive"
                        } cursor-pointer ${
                          !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "justify-start"
                        }`}
                        tabIndex={permission ? undefined : 0}
                        aria-hidden={permission ? undefined : false}
                      >
                        <span className="menu-item-icon-inactive">
                          <span className="inline-block h-3 w-3 rounded-full bg-gray-400"></span>
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text">{page.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                  return permission ? (
                    <Authorized action={permission} fallback={null} key={page.name}>
                      {navItem}
                    </Authorized>
                  ) : (
                    navItem
                  );
                })}
              </ul>
            </div>
            {/* Client Pages Group */}
            <div>
              <Authorized action={NAV_PERMISSIONS.PAGE_HEADINGS} fallback={null}>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Client Pages"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              </Authorized>
              <ul className="flex flex-col gap-4">
                {clientPages.map((page) => {
                  const permission = navPermissionMap[page.path];
                  const navItem = (
                    <li key={page.name} data-testid={`nav-item-${page.name.toLowerCase()}`}>
                      <Link
                        href={page.path}
                        className={`menu-item group ${
                          isActive(page.path)
                            ? "menu-item-active"
                            : "menu-item-inactive"
                        } cursor-pointer ${
                          !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "justify-start"
                        }`}
                      >
                        <span className="menu-item-icon-inactive">
                          <span className="inline-block h-3 w-3 rounded-full bg-gray-400"></span>
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text">{page.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                  return permission ? (
                    <Authorized action={permission} fallback={null} key={page.name}>
                      {navItem}
                    </Authorized>
                  ) : (
                    navItem
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
        {/*        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;