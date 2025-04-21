import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Success | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Success page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Success() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />
      <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
        <div className="mx-auto mb-10 w-full max-w-[100px] text-center sm:max-w-[160px]">
          <Image
            src="./images/error/success.svg"
            alt="success"
            className="dark:hidden"
            width={148}
            height={148}
          />
          <Image
            src="./images/error/success-dark.svg"
            alt="success"
            className="hidden dark:block"
            width={148}
            height={148}
          />
        </div>

        <h1 className="text-title-md xl:text-title-2xl mb-2 font-bold text-gray-800 dark:text-white/90">
          SUCCESS !
        </h1>

        <p className="my-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          Awesome! your message has been sent successfully, Our support team
          will get back to you as soon as possible.
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
  );
}
