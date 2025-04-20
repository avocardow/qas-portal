import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

interface DashboardPlaceholderProps {
  heading: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const DashboardPlaceholderPageTemplate: React.FC<DashboardPlaceholderProps> = ({
  heading,
  message = "Coming Soon",
  children,
  className = "",
}) => (
  <div>
    <PageBreadcrumb pageTitle={heading} />
    <div
      className={`min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="mx-auto w-full max-w-[630px] text-center">
        <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
          {heading}
        </h3>
        <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
          {message}
        </p>
        {children}
      </div>
    </div>
  </div>
);

export default DashboardPlaceholderPageTemplate;
