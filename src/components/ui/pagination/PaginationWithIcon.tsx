import React, { useState } from "react";

interface PaginationProps {
  totalPages: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export default function PaginationWithIcon({
  totalPages,
  initialPage = 1,
  onPageChange,
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    // If few pages, show all
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(renderPageButton(i));
      }
    } else {
      if (currentPage === 1) {
        // First page: [1] 2 3 ... N
        [1, 2, 3].forEach((i) => pageNumbers.push(renderPageButton(i)));
        pageNumbers.push(renderEllipsis());
        pageNumbers.push(renderPageButton(totalPages));
      } else if (currentPage === totalPages) {
        // Last page: 1 ... N-2 N-1 [N]
        pageNumbers.push(renderPageButton(1));
        pageNumbers.push(renderEllipsis());
        [totalPages - 2, totalPages - 1, totalPages].forEach((i) =>
          pageNumbers.push(renderPageButton(i))
        );
      } else {
        // Middle pages: 1 ... [current] ... N
      pageNumbers.push(renderPageButton(1));
        pageNumbers.push(renderEllipsis());
        pageNumbers.push(renderPageButton(currentPage));
        pageNumbers.push(renderEllipsis());
      pageNumbers.push(renderPageButton(totalPages));
    }
    }
    return pageNumbers;
  };

  const renderPageButton = (page: number) => (
    <li key={page}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange(page);
        }}
        className={`flex size-10 items-center justify-center rounded-lg text-sm font-medium ${
          currentPage === page
            ? "bg-brand-500 hover:bg-brand-600 text-white"
            : "hover:bg-brand-500 text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        {page}
      </a>
    </li>
  );

  const renderEllipsis = () => (
    <li key="ellipsis">
      <span className="flex size-10 items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-400">
        ...
      </span>
    </li>
  );

  return (
    <div className="flex items-center gap-8 px-6 py-4 min-w-full justify-center">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        <span>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
              fill=""
            />
          </svg>
        </span>
      </button>

      <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <ul className="hidden items-center gap-0.5 sm:flex">
        {renderPageNumbers()}
      </ul>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        <span>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
              fill=""
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
