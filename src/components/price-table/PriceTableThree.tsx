import React from "react";
import { CheckLineIcon } from "../../icons";

const personalPack = [
  "Unlimited Projects",
  "Share with 5 team members",
  "Sync across devices",
];
const professionalPack = [
  "Unlimited Projects",
  "Share with 5 team members",
  "Sync across devices",
  "30 days version history",
];
const teamPack = [
  "Unlimited Projects",
  "Share with 5 team members",
  "Sync across devices",
  "Sharing permissions",
  "Admin tools",
];
const enterprisePack = [
  "Unlimited Projects",
  "Share with 5 team members",
  "Sync across devices",
  "Sharing permissions",
  "User provisioning (SCIM)",
  "Advanced security",
];

export default function PriceTableThree() {
  return (
    <div className="gird-cols-1 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-3 2xl:grid-cols-4">
      {/* <!-- Pricing item --> */}
      <div>
        <div className="rounded-2xl bg-white p-6 dark:bg-white/[0.03]">
          <span className="text-theme-xl block font-semibold text-gray-800 dark:text-white/90">
            Personal
          </span>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Perfect plan for Starters
          </p>

          <h2 className="text-title-sm mb-0.5 mt-4 font-bold text-gray-800 dark:text-white/90">
            Free
          </h2>

          <span className="mb-6 inline-block text-sm text-gray-500 dark:text-gray-400">
            For a Lifetime
          </span>

          <button
            disabled
            className="shadow-theme-xs flex h-11 w-full items-center justify-center rounded-lg border border-gray-300 bg-white p-3.5 text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-800 disabled:pointer-events-none dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Current Plan
          </button>

          <ul className="mt-6 space-y-3">
            {personalPack.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-400"
              >
                <CheckLineIcon className="text-success-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* <!-- Pricing item --> */}
      <div>
        <div className="rounded-2xl bg-white p-6 dark:bg-white/[0.03]">
          <span className="text-theme-xl block font-semibold text-gray-800 dark:text-white/90">
            Professional
          </span>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            For users who want to do more
          </p>

          <h2 className="text-title-sm mb-0.5 mt-4 font-bold text-gray-800 dark:text-white/90">
            $99.00
          </h2>

          <span className="mb-6 inline-block text-sm text-gray-500 dark:text-gray-400">
            /year
          </span>

          <button className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 flex h-11 w-full items-center justify-center rounded-lg p-3.5 text-sm font-medium text-white">
            Try for Free
          </button>

          <ul className="mt-6 space-y-3">
            {professionalPack.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-400"
              >
                <CheckLineIcon className="text-success-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* <!-- Pricing item --> */}
      <div>
        <div className="bg-brand-500 z-1 relative rounded-2xl p-6">
          <div className="text-theme-xs -z-1 absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1 font-medium text-white">
            Recommended
          </div>
          <span className="text-theme-xl block font-semibold text-white">
            {" "}
            Team{" "}
          </span>

          <p className="mt-1 text-sm text-white/90">
            Your entire team in one place
          </p>

          <h2 className="text-title-sm mb-0.5 mt-4 font-bold text-white">
            $299
          </h2>

          <span className="mb-6 inline-block text-sm text-white/90">
            {" "}
            /year{" "}
          </span>

          <button className="shadow-theme-xs flex h-11 w-full items-center justify-center rounded-lg bg-white p-3.5 text-sm font-medium text-gray-800 hover:bg-gray-50">
            Try for Free
          </button>

          <ul className="mt-6 space-y-3">
            {teamPack.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm text-white"
              >
                <CheckLineIcon className="text-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* <!-- Pricing item --> */}
      <div>
        <div className="rounded-2xl bg-white p-6 dark:bg-white/[0.03]">
          <span className="text-theme-xl block font-semibold text-gray-800 dark:text-white/90">
            Enterprise
          </span>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Run your company on your terms
          </p>

          <h2 className="text-title-sm mb-0.5 mt-4 font-bold text-gray-800 dark:text-white/90">
            Custom
          </h2>

          <span className="mb-6 inline-block text-sm text-gray-500 dark:text-gray-400">
            Reach out for a quote
          </span>

          <button className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 flex h-11 w-full items-center justify-center rounded-lg p-3.5 text-sm font-medium text-white">
            Try for Free
          </button>

          <ul className="mt-6 space-y-3">
            {enterprisePack.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-400"
              >
                <CheckLineIcon className="text-success-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
