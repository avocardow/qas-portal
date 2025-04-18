"use client";
import { signIn } from "next-auth/react";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React from "react";

export default function SignInForm() {
  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <h1 className="text-title-sm sm:text-title-md mb-4 font-semibold text-gray-800 dark:text-white/90">
            Sign In
          </h1>
          <button
            onClick={() => signIn("azure-ad")}
            className="mb-4 inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-sm border border-[#767676] bg-[#F3F3F3] px-8 font-sans text-sm font-normal text-black hover:bg-[#e1e1e1]"
          >
            <img
              src="/assets/microsoft-logo.svg"
              alt=""
              aria-hidden="true"
              className="mr-2 h-[18px] w-[18px]"
            />
            Sign in with Microsoft
          </button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
