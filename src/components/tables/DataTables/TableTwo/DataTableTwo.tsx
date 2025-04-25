/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import {
  AngleDownIcon,
  AngleUpIcon,
  PencilIcon,
  XMarkIcon,
} from "../../../../icons";
import PaginationWithButton from "./PaginationWithButton";
import ViewActionButton from "@/components/common/ViewActionButton";
import { useRole } from "@/context/RbacContext";

// Column and props definitions for flexibility
export interface ColumnDef {
  key: string;
  header: string;
  sortable?: boolean;
  cell?: (row: any) => React.ReactNode;
}

export interface DataTableTwoProps {
  data?: any[];
  columns?: ColumnDef[];
  onView?: (row: any) => void;
  extraControls?: React.ReactNode;
  totalDbEntries?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  isLoading?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// Skeleton Row Component (Basic Example)
const SkeletonRow = ({ columnCount }: { columnCount: number }) => (
  <TableRow className="animate-pulse">
    {Array.from({ length: columnCount + 1 }).map(
      (
        _,
        i // +1 for action column
      ) => (
        <TableCell key={i} className="h-12 px-4 py-3">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
        </TableCell>
      )
    )}
  </TableRow>
);

export default function DataTableTwo({
  data,
  columns,
  onView,
  extraControls,
  totalDbEntries,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onItemsPerPageChange,
  isLoading,
  searchTerm,
  setSearchTerm,
}: DataTableTwoProps) {
  const [sortKey, setSortKey] = useState<string>(
    columns && columns.length ? columns[0].key : "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const currentRole = useRole();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default columns if not provided
  const defaultColumns: ColumnDef[] = [
    { key: "name", header: "User", sortable: true },
    { key: "position", header: "Position", sortable: true },
    { key: "location", header: "Office", sortable: true },
    { key: "age", header: "Age", sortable: true },
    { key: "date", header: "Start Date", sortable: true },
    { key: "salary", header: "Salary", sortable: true },
  ];
  const cols = columns ?? defaultColumns;

  // Use pageSize prop for items per page
  const itemsPerPage = pageSize;

  // Data is now passed directly from parent, already filtered/paginated
  const currentData = useMemo(() => {
    // Apply local sorting to the data received for the current page
    return (data ?? []).sort((a, b) => {
      if (sortKey === "salary") {
        const rawA = (a as any)[sortKey];
        const salaryA = Number.parseInt(String(rawA).replace(/\$|,/g, ""));
        const rawB = (b as any)[sortKey];
        const salaryB = Number.parseInt(String(rawB).replace(/\$|,/g, ""));
        return sortOrder === "asc" ? salaryA - salaryB : salaryB - salaryA;
      }
      return sortOrder === "asc"
        ? String(a[sortKey]).localeCompare(String(b[sortKey]))
        : String(b[sortKey]).localeCompare(String(a[sortKey]));
    });
  }, [data, sortKey, sortOrder]);

  // Calculate totalItems based on prop or fallback
  const totalItems = totalDbEntries ?? (data ?? []).length;
  // Calculate totalPages based on totalItems and pageSize prop
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleItemsPerPageChange = (value: number) => {
    // Call the handler passed from the parent, if provided
    if (onItemsPerPageChange) {
      onItemsPerPageChange(value);
    } else {
      // Fallback or warning if needed, though ideally parent controls this
      console.warn("DataTableTwo: onItemsPerPageChange handler not provided.");
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Calculate startIndex and endIndex based on props for display message
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Effect for Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 rounded-t-xl border border-b-0 border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {" "}
              Show{" "}
            </span>
            <div className="relative z-20 bg-transparent">
              <select
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-9 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none py-2 pr-8 pl-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
              >
                {[5, 8, 10].map((value) => (
                  <option
                    key={value}
                    value={value}
                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                  >
                    {value}
                  </option>
                ))}
              </select>
              <span className="absolute top-1/2 right-2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {" "}
              entries{" "}
            </span>
          </div>

          {extraControls && (
            <div className="flex items-center space-x-2">{extraControls}</div>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Clients or Contacts (⌘K)..."
            aria-label="Search Clients or Contacts"
            className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-9 w-full rounded-lg border border-gray-300 bg-transparent py-2 pr-16 pl-4 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-10 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.33358 1.3335C4.01358 1.3335 1.33358 4.0135 1.33358 7.3335C1.33358 10.6535 4.01358 13.3335 7.33358 13.3335C10.6536 13.3335 13.3336 10.6535 13.3336 7.3335C13.3336 4.0135 10.6536 1.3335 7.33358 1.3335ZM0.000244141 7.3335C0.000244141 3.2835 3.28758 0.000164843 7.33358 0.000164843C11.3796 0.000164843 14.6669 3.2835 14.6669 7.3335C14.6669 11.3835 11.3796 14.6668 7.33358 14.6668C3.28758 14.6668 0.000244141 11.3835 0.000244141 7.3335Z"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.6667 11.6665C11.9596 11.3736 12.4344 11.3736 12.7273 11.6665L15.7879 14.7271C16.0808 15.02 16.0808 15.4948 15.7879 15.7877C15.4949 16.0806 15.0201 16.0806 14.7272 15.7877L11.6667 12.7271C11.3737 12.4342 11.3737 11.9594 11.6667 11.6665Z"
              ></path>
            </svg>
          </span>
          {isLoading && (
            <span className="ml-2 text-xs text-gray-500">Loading...</span>
          )}
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div>
          <Table>
            <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {cols.map(({ key, header, sortable }) => (
                  <TableCell
                    key={key}
                    isHeader
                    className="border border-gray-100 px-4 py-3 dark:border-white/[0.05]"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => sortable && handleSort(key)}
                    >
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                        {header}
                      </p>
                      <button className="flex flex-col gap-0.5">
                        <AngleUpIcon
                          className={`text-gray-300 dark:text-gray-700 ${
                            sortKey === key && sortOrder === "asc"
                              ? "text-brand-500"
                              : ""
                          }`}
                        />
                        <AngleDownIcon
                          className={`text-gray-300 dark:text-gray-700 ${
                            sortKey === key && sortOrder === "desc"
                              ? "text-brand-500"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </TableCell>
                ))}
                <TableCell
                  isHeader
                  className="border border-gray-100 px-4 py-3 dark:border-white/[0.05]"
                >
                  <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                    Action
                  </p>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? // Render skeleton rows when loading
                  Array.from({ length: pageSize }).map((_, index) => (
                    <SkeletonRow
                      key={`skeleton-${index}`}
                      columnCount={cols.length}
                    />
                  ))
                : // Render actual data rows when not loading
                  currentData.map((item, i) => (
                    <TableRow key={item.id ?? i}>
                      {cols.map(({ key, cell }) => (
                        <TableCell
                          key={key}
                          className="text-theme-sm border border-gray-100 p-4 font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400"
                        >
                          {cell ? cell(item) : (item[key] ?? "-")}
                        </TableCell>
                      ))}
                      <TableCell className="text-theme-sm border border-gray-100 p-4 font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-white/90">
                        <div className="flex w-full items-center gap-2">
                          {onView &&
                            currentRole &&
                            ["Admin", "Manager", "Client"].includes(
                              currentRole
                            ) && (
                              <ViewActionButton onClick={() => onView(item)} />
                            )}
                          {currentRole === "Admin" && (
                            <button
                              aria-label="Edit"
                              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                            >
                              <PencilIcon />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-100 py-4 pr-4 pl-[18px] dark:border-white/[0.05]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
          <PaginationWithButton
            totalPages={totalPages}
            initialPage={currentPage}
            onPageChange={onPageChange}
          />
          <div className="pt-3 xl:pt-0">
            <p className="border-t border-gray-100 pt-3 text-center text-sm font-medium text-gray-500 xl:border-t-0 xl:pt-0 xl:text-left dark:border-gray-800 dark:text-gray-400">
              Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of{" "}
              {totalItems} entries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
