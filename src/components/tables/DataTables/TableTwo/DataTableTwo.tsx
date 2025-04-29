"use client";
import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import { useRole } from "@/context/RbacContext";
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
  XMarkIcon,
  PencilIcon,
} from "@/icons";
import PaginationWithButton from "./PaginationWithButton";
import Authorized from "../../../Authorized";
import ViewActionButton from "@/components/common/ViewActionButton";

// Column and props definitions for flexibility
export interface ColumnDef {
  key: string;
  header: string;
  sortable?: boolean;
  cell?: (row: any) => React.ReactNode;
  permission?: string; // Optional permission required to view this column
}

export interface DataTableTwoProps {
  data?: any[];
  columns?: ColumnDef[];
  extraControls?: React.ReactNode;
  /** Optional handler when a row is clicked */
  onRowClick?: (row: any) => void;
  /** Optional handler for View action */
  onView?: (row: any) => void;
  /** Optional handler for Edit action */
  onEdit?: (row: any) => void;
  totalDbEntries?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  isLoading?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  serverSide?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (key: string, order: "asc" | "desc") => void;
}

// Skeleton Row Component (Basic Example)
const SkeletonRow = ({ columnCount }: { columnCount: number }) => (
  <TableRow className="animate-pulse">
    {Array.from({ length: columnCount }).map(
      (
        _,
        i
      ) => (
        <TableCell key={i} className="h-12 px-4 py-3">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
        </TableCell>
      )
    )}
  </TableRow>
);

// Define DataTableTwo as a React functional component with explicit props to ensure TS recognizes all props
const DataTableTwo: React.FC<DataTableTwoProps> = ({
  data,
  columns,
  onRowClick,
  onView,
  onEdit,
  extraControls,
  totalDbEntries,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onItemsPerPageChange,
  isLoading,
  searchTerm,
  setSearchTerm,
  serverSide = false,
  sortBy: sortByProp,
  sortOrder: sortOrderProp,
  onSortChange,
}: DataTableTwoProps) => {
  // Determine user role for action button visibility
  const role = useRole() ?? "";
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Default columns if not provided
  const baseColumns = React.useMemo<ColumnDef[]>(() => [
    { key: "name", header: "User", sortable: true },
    { key: "position", header: "Position", sortable: true },
    { key: "location", header: "Office", sortable: true },
    { key: "age", header: "Age", sortable: true },
    { key: "date", header: "Start Date", sortable: true },
    { key: "salary", header: "Salary", sortable: true },
  ], []);
  const cols = columns ?? baseColumns;

  // Use pageSize prop for items per page
  const itemsPerPage = pageSize;

  // Internal sort state for client-side mode
  const [internalSortKey, setInternalSortKey] = React.useState<string>(
    columns && columns.length ? columns[0].key : "name"
  );
  const [internalSortOrder, setInternalSortOrder] = React.useState<"asc" | "desc">("asc");

  // Data is now passed directly from parent, already filtered/paginated
  const currentData = React.useMemo(() => {
    // Always client-side sort when sorting by auditStageName
    if (serverSide && internalSortKey !== "auditStageName") {
      return data ?? [];
    }
    // Client-side sorting (covers auditStageName and other keys)
    return (data ?? []).sort((a, b) => {
      // Numeric sort for auditStageId
      if (internalSortKey === "auditStageId") {
        const aId = Number((a as any)[internalSortKey] ?? 0);
        const bId = Number((b as any)[internalSortKey] ?? 0);
        return internalSortOrder === "asc" ? aId - bId : bId - aId;
      }
      if (internalSortKey === "salary") {
        const rawA = (a as any)[internalSortKey];
        const salaryA = Number.parseInt(String(rawA).replace(/\$|,/g, ""));
        const rawB = (b as any)[internalSortKey];
        const salaryB = Number.parseInt(String(rawB).replace(/\$|,/g, ""));
        return internalSortOrder === "asc" ? salaryA - salaryB : salaryB - salaryA;
      }
      return internalSortOrder === "asc"
        ? String(a[internalSortKey]).localeCompare(String(b[internalSortKey]))
        : String(b[internalSortKey]).localeCompare(String(a[internalSortKey]));
    });
  }, [data, serverSide, internalSortKey, internalSortOrder]);

  // Paginate sorted data to avoid rendering all rows at once
  const paginatedData = React.useMemo(() => {
    if (serverSide) {
      // In server-side mode, data already represents current page
      return data ?? [];
    }
    const start = (currentPage - 1) * itemsPerPage;
    return currentData.slice(start, start + itemsPerPage);
  }, [serverSide, data, currentData, currentPage, itemsPerPage]);

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
    if (serverSide && onSortChange) {
      // Toggle server-side sort order or default to asc
      const newOrder = sortByProp === key && sortOrderProp === "asc" ? "desc" : "asc";
      onSortChange(key, newOrder);
      return;
    }
    // Client-side sorting
    if (internalSortKey === key) {
      setInternalSortOrder(internalSortOrder === "asc" ? "desc" : "asc");
    } else {
      setInternalSortKey(key);
      setInternalSortOrder("asc");
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

  // Prepare dropdown options, including current itemsPerPage if not preset
  const pageOptions = React.useMemo<number[]>(() => {
    const presets = [10, 25, 50, 100, 250, 500];
    return presets.includes(itemsPerPage) ? presets : [itemsPerPage, ...presets];
  }, [itemsPerPage]);

  // Determine effective sort parameters
  const currentSortKey = serverSide && sortByProp ? sortByProp : internalSortKey;
  const currentSortOrder = serverSide && sortOrderProp ? sortOrderProp : internalSortOrder;

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 rounded-t-xl border border-b-0 border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="datatable-pagesize-select" className="sr-only">
              Entries per page
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400"> Show </span>
            <div className="relative z-20 bg-transparent">
              <select
                id="datatable-pagesize-select"
                data-testid="datatable-select"
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-9 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none py-2 pr-8 pl-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
              >
                {pageOptions.map((value) => (
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
            data-testid="datatable-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Clients/Contacts..."
            aria-label="Search Clients/Contacts"
            className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-9 min-w-[250px] w-full rounded-lg border border-gray-300 bg-transparent py-2 pr-12 pl-4 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
          {/* Show magnifier when empty, clear icon when there's input */}
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              data-testid="datatable-clear-button"
              aria-label="Clear search"
              className="absolute top-1/2 right-4 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-4 w-4 fill-current" />
            </button>
          ) : (
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
          )}
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div>
          <Table>
            <caption className="sr-only" data-testid="datatable-caption">Clients table</caption>
            <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {cols.map(({ key, header, sortable, permission }, idx) => {
                  // Add lg:sticky to freeze the first column on desktop (no extra background)
                  const headerSticky = idx === 0 ? 'lg:sticky lg:left-0 lg:z-10 lg:bg-white lg:dark:bg-[#1c2539]' : '';
                  if (permission) {
                    return (
                      <Authorized key={key} action={permission} fallback={null}>
                        <TableCell
                          isHeader
                          scope="col"
                          aria-sort={
                            currentSortKey === key
                              ? currentSortOrder === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                          className={`border border-gray-100 px-4 py-3 min-w-[110px] whitespace-nowrap dark:border-white/[0.05] ${headerSticky}`}
                        >
                          {sortable ? (
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-0"
                              onClick={() => handleSort(key)}
                              aria-label={header}
                            >
                              <span className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                                {header}
                              </span>
                              <span aria-hidden="true" className="flex flex-col gap-0.5">
                                <AngleUpIcon
                                  className={`text-gray-300 dark:text-gray-700 ${
                                    currentSortKey === key && currentSortOrder === "asc" ? "text-brand-500" : ""
                                  }`}
                                />
                                <AngleDownIcon
                                  className={`text-gray-300 dark:text-gray-700 ${
                                    currentSortKey === key && currentSortOrder === "desc" ? "text-brand-500" : ""
                                  }`}
                                />
                              </span>
                            </button>
                          ) : (
                            <span className="block w-full text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                              {header}
                            </span>
                          )}
                        </TableCell>
                      </Authorized>
                    );
                  }
                  return (
                    <TableCell
                      key={key}
                      isHeader
                      scope="col"
                      aria-sort={
                        currentSortKey === key
                          ? currentSortOrder === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={`border border-gray-100 px-4 py-3 min-w-[110px] whitespace-nowrap dark:border-white/[0.05] ${headerSticky}`}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-0"
                          onClick={() => handleSort(key)}
                          aria-label={header}
                        >
                          <span className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                            {header}
                          </span>
                          <span aria-hidden="true" className="flex flex-col gap-0.5">
                            <AngleUpIcon
                              className={`text-gray-300 dark:text-gray-700 ${
                                currentSortKey === key && currentSortOrder === "asc" ? "text-brand-500" : ""
                              }`}
                            />
                            <AngleDownIcon
                              className={`text-gray-300 dark:text-gray-700 ${
                                currentSortKey === key && currentSortOrder === "desc" ? "text-brand-500" : ""
                              }`}
                            />
                          </span>
                        </button>
                      ) : (
                        <span className="block w-full text-left text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                          {header}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: pageSize }).map((_, index) => (
                    <SkeletonRow
                      key={`skeleton-${index}`}
                      columnCount={cols.length}
                    />
                  ))
                : paginatedData.length > 0
                ? paginatedData.map((item, i) => (
                    <TableRow
                      key={item.id ?? i}
                      onClick={() => onRowClick?.(item)}
                      className={
                        onRowClick
                          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                          : undefined
                      }
                    >
                      {cols.map(({ key, cell, permission }, idx) => {
                        // Freeze first column on desktop (no extra background)
                        const cellSticky = idx === 0 ? 'lg:sticky lg:left-0 lg:z-10 lg:bg-white lg:dark:bg-[#1c2539]' : '';
                        if (permission) {
                          return (
                            <Authorized key={key} action={permission} fallback={null}>
                              <TableCell
                                className={`text-theme-sm border border-gray-100 p-4 font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400 ${cellSticky}`}
                              >
                                {cell ? cell(item) : (item[key] ?? "-")}
                              </TableCell>
                            </Authorized>
                          );
                        }
                        return (
                          <TableCell
                            key={key}
                            className={`text-theme-sm border border-gray-100 p-4 font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400 ${cellSticky}`}
                          >
                            {cell ? cell(item) : (item[key] ?? "-")}
                          </TableCell>
                        );
                      })}
                      {/* Action buttons cell */}
                      {(onView && ["Admin","Manager","Client"].includes(role)) || role === "Admin" ? (
                        <TableCell key="actions" className="text-theme-sm border border-gray-100 p-4 font-normal whitespace-nowrap text-gray-800 dark:border-white/[0.05] dark:text-gray-400">
                          {onView && ["Admin","Manager","Client"].includes(role) && (
                            <ViewActionButton onClick={() => onView(item)} />
                          )}
                          {role === "Admin" && (
                            <button aria-label="Edit" onClick={() => onEdit?.(item)} className="ml-2">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={cols.length} className="text-center p-4">
                        No entries found
                      </TableCell>
                    </TableRow>
                  )}
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
};

export default DataTableTwo;
