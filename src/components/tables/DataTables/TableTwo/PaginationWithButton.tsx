"use client";

import { useState, useEffect } from "react";

interface PaginationProps {
  totalPages: number;
  initialPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

// Helper function to generate page numbers with ellipses
const getPageNumbers = (
  totalPages: number,
  currentPage: number,
  maxVisibleDesktop: number,
  maxVisibleMobile: number
): (number | null)[] => {
  // Determine maxVisible based on a breakpoint (e.g., sm)
  // Note: Using window width directly in React is tricky for SSR/initial render.
  // A better approach might involve CSS or a dedicated hook, but for simplicity,
  // we'll structure the logic assuming we can determine this.
  // Let's simulate with a fixed assumption for now or require a media query hook.
  // For this example, we'll just use the desktop logic for now and adjust later if needed.
  // TODO: Implement proper responsive check (e.g., useMediaQuery hook)
  const isMobile = false; // Placeholder: replace with actual check
  const maxVisible = isMobile ? maxVisibleMobile : maxVisibleDesktop;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [];
  const sideWidth = isMobile ? 1 : 2; // How many numbers to show on each side of current
  const leftBound = currentPage - sideWidth;
  const rightBound = currentPage + sideWidth;

  pages.push(1); // Always show first page

  // Ellipsis or numbers after first page
  if (leftBound > 2) {
    pages.push(null); // Ellipsis
  } else if (leftBound === 2) {
    pages.push(2);
  }

  // Middle numbers
  for (
    let i = Math.max(2, leftBound);
    i <= Math.min(totalPages - 1, rightBound);
    i++
  ) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  // Ellipsis or numbers before last page
  if (rightBound < totalPages - 1) {
    pages.push(null); // Ellipsis
  } else if (rightBound === totalPages - 1) {
    pages.push(totalPages - 1);
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages); // Always show last page
  }

  // Refine ellipsis placement - ensure only one if needed near ends
  const finalPages: (number | null)[] = [];
  let lastPushed: number | null = null;
  for (const p of pages) {
    if (p === null && lastPushed === null) continue; // Avoid double ellipsis
    finalPages.push(p);
    lastPushed = p;
  }

  return finalPages;
};

export default function PaginationWithButton({
  totalPages,
  initialPage = 1,
  currentPage: controlledCurrentPage,
  onPageChange,
}: PaginationProps) {
  // Internal state manages page if not controlled externally
  const [internalCurrentPage, setInternalCurrentPage] = useState(initialPage);

  // Determine the effective current page (controlled or internal state)
  const currentPage = controlledCurrentPage ?? internalCurrentPage;

  // Sync internal state if initialPage changes (useful if parent resets)
  useEffect(() => {
    setInternalCurrentPage(initialPage);
  }, [initialPage]);

  // Sync internal state if controlled page changes
  useEffect(() => {
    if (controlledCurrentPage !== undefined) {
      setInternalCurrentPage(controlledCurrentPage);
    }
  }, [controlledCurrentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    // Update internal state only if not controlled
    if (controlledCurrentPage === undefined) {
      setInternalCurrentPage(page);
    }
    // Always call the parent handler
    onPageChange?.(page);
  };

  const renderPageNumbers = () => {
    // Define max visible pages for desktop and mobile
    const maxVisibleDesktop = 7; // e.g., 1 ... 4 5 6 ... 10 (includes first, last, current, 2 neighbours, 2 ellipsis)
    const maxVisibleMobile = 5; // e.g., 1 ... 4 5 ... 10

    // Generate the page numbers/ellipses to display
    const pagesToRender = getPageNumbers(
      totalPages,
      currentPage,
      maxVisibleDesktop,
      maxVisibleMobile
    );

    // TODO: Add responsive classes (hidden sm:flex) based on actual mobile detection
    return pagesToRender.map((page, index) => (
      <li key={`page-${page ?? `ellipsis-${index}`}`}>
        {page ? renderPageButton(page) : renderEllipsis()}
      </li>
    ));
  };

  const renderPageButton = (page: number) => {
    return (
      <button
        onClick={() => handlePageChange(page)}
        className={`rounded px-4 py-2 ${
          currentPage === page
            ? "bg-brand-500 text-white"
            : "text-gray-700 dark:text-gray-400"
        } hover:text-brand-500 dark:hover:text-brand-500 flex size-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-blue-500/[0.08]`}
      >
        {page}
      </button>
    );
  };

  const renderEllipsis = () => {
    return (
      <span className="flex size-10 items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-400">
        ...
      </span>
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 xl:justify-start">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="shadow-theme-xs flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        {/* Responsive Label */}
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {/* Use flex-wrap and potentially hide on very small screens if needed */}
      <ul className="hidden items-center gap-1 sm:flex">
        {renderPageNumbers()}
      </ul>
      {/* Consider a simpler mobile display if numbers + ellipsis still too wide */}
      <div className="flex items-center sm:hidden">
        <span className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="shadow-theme-xs flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        {/* Responsive Label */}
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
      </button>
    </div>
  );
}
