import React from "react";
import { DollarLineIcon, GroupIcon, ShootingStarIcon } from "../../icons";

export default function MarketingMetricsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex size-[52px] items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/[0.90]">
          <ShootingStarIcon />
        </div>

        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Avg. Client Rating
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
              7.8/10
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <span className="bg-success-50 text-theme-xs text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
              +20%
            </span>

            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              Vs last month
            </span>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex size-[52px] items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/[0.90]">
          <GroupIcon />
        </div>

        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Instagram Followers
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
              5,934
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <span className="bg-error-50 text-theme-xs text-error-600 dark:bg-error-500/15 dark:text-error-500 flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
              -3.59%
            </span>

            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              Vs last month
            </span>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex size-[52px] items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/[0.90]">
          <DollarLineIcon />
        </div>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Total Revenue
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
              $9,758
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <span className="bg-success-50 text-theme-xs text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
              +15%
            </span>

            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              Vs last month
            </span>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
