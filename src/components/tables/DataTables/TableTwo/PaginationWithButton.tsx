"use client";

import React, { useState, useEffect } from "react";

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
  siblings = 1 // Number of pages to show on each side of currentPage
): (number | null)[] => {
  const totalPageNumbersToShow = siblings * 2 + 3; // siblings + current + first + last
  const totalSlots = totalPageNumbersToShow + 2; // + 2 for potential ellipses

  // Case 1: Total pages is less than or equal to what we want to show
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblings, 1);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 2: No left ellipsis, but right ellipsis needed
  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 1 + 2 * siblings + 1; // 1 + current + siblings
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, null, lastPageIndex];
  }

  // Case 3: No right ellipsis, but left ellipsis needed
  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 1 + 2 * siblings + 1; // 1 + current + siblings
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, null, ...rightRange];
  }

  // Case 4: Both ellipses needed
  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, null, ...middleRange, null, lastPageIndex];
  }

  // Fallback (should not be reached if logic is correct)
  return Array.from({ length: totalPages }, (_, i) => i + 1);
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
    // Define siblings count (e.g., 1 means N-1, N, N+1)
    const siblingCount = 1;

    const pagesToRender = getPageNumbers(totalPages, currentPage, siblingCount);

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