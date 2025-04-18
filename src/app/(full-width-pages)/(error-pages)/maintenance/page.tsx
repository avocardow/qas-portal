import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Maintenance | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Maintenance page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Maintenance() {
  return (
    <div className="z-1 relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />

      <div>
        <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
          <div className="mx-auto mb-10 w-full max-w-[155px] text-center sm:max-w-[204px]">
            <Image
              src="/images/error/maintenance.svg"
              alt="maintenance"
              className="dark:hidden"
              width={205}
              height={205}
            />
            <Image
              src="/images/error/maintenance-dark.svg"
              alt="maintenance"
              className="hidden dark:block"
              width={205}
              height={205}
            />
          </div>

          <h1 className="text-title-md xl:text-title-2xl mb-2 font-bold text-gray-800 dark:text-white/90">
            MAINTENANCE
          </h1>

          <p className="my-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
            Our Site is Currently under maintenance We will be back Shortly
            Thank You For Patience
          </p>

          <Link
            href="/"
            className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Back to Home Page
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - TailAdmin
        </p>
      </div>
    </div>
  );
}
