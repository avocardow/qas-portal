import React from "react";
import { CardDescription, CardTitle } from "../../ui/card";
import Link from "next/link";

export default function CardLinkOne() {
  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div>
          <CardTitle>Card title</CardTitle>

          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi
            architecto aspernatur cum et ipsum
          </CardDescription>

          <Link
            href="/"
            className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
          >
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
}
