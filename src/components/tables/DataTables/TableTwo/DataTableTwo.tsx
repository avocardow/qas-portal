/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { AngleDownIcon, AngleUpIcon, PencilIcon } from "../../../../icons";
import PaginationWithButton from "./PaginationWithButton";
import ViewActionButton from "@/components/common/ViewActionButton";
import { useRole } from "@/context/RbacContext";
import useSearchService from "@/hooks/useSearchService";

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
  searchFn?: (term: string, signal: AbortSignal) => Promise<any[]>;
  searchDelay?: number;
  extraControls?: React.ReactNode;
}

// Original static data fallback
const staticTableData = [
  {
    id: 1,
    name: "Abram Schleifer",
    position: "Sales Assistant",
    location: "Edinburgh",
    age: 57,
    date: "25 Apr, 2027",
    salary: "$89,500",
  },
  {
    id: 2,
    name: "Charlotte Anderson",
    position: "Marketing Manager",
    location: "London",
    age: 42,
    date: "12 Mar, 2025",
    salary: "$105,000",
  },
  {
    id: 3,
    name: "Ethan Brown",
    position: "Software Engineer",
    location: "San Francisco",
    age: 30,
    date: "01 Jan, 2024",
    salary: "$120,000",
  },
  {
    id: 4,
    name: "Sophia Martinez",
    position: "Product Manager",
    location: "New York",
    age: 35,
    date: "15 Jun, 2026",
    salary: "$95,000",
  },
  {
    id: 5,
    name: "James Wilson",
    position: "Data Analyst",
    location: "Chicago",
    age: 28,
    date: "20 Sep, 2025",
    salary: "$80,000",
  },
  {
    id: 6,
    name: "Olivia Johnson",
    position: "HR Specialist",
    location: "Los Angeles",
    age: 40,
    date: "08 Nov, 2026",
    salary: "$75,000",
  },
  {
    id: 7,
    name: "William Smith",
    position: "Financial Analyst",
    location: "Seattle",
    age: 38,
    date: "03 Feb, 2026",
    salary: "$88,000",
  },
  {
    id: 8,
    name: "Isabella Davis",
    position: "UI/UX Designer",
    location: "Austin",
    age: 29,
    date: "18 Jul, 2025",
    salary: "$92,000",
  },
  {
    id: 9,
    name: "Liam Moore",
    position: "DevOps Engineer",
    location: "Boston",
    age: 33,
    date: "30 Oct, 2024",
    salary: "$115,000",
  },
  {
    id: 10,
    name: "Mia Garcia",
    position: "Content Strategist",
    location: "Denver",
    age: 27,
    date: "12 Dec, 2027",
    salary: "$70,000",
  },
];

export default function DataTableTwo({
  data,
  columns,
  onView,
  searchFn,
  searchDelay = 300,
  extraControls,
}: DataTableTwoProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string>(
    columns && columns.length ? columns[0].key : "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const currentRole = useRole();

  // Use provided data or fallback
  const tableData = data ?? staticTableData;
  // Fallback local search if no searchFn provided
  const fallbackSearchFn = useCallback(
    (term: string, _signal: AbortSignal) => {
      void _signal;
      const lower = term.toLowerCase();
      return Promise.resolve(
        tableData.filter((item) =>
          Object.values(item).some(
            (value) =>
              typeof value === "string" && value.toLowerCase().includes(lower)
          )
        )
      );
    },
    [tableData]
  );
  const {
    searchTerm,
    setSearchTerm,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useSearchService<any[]>(searchFn ?? fallbackSearchFn, searchDelay);
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

  const filteredAndSortedData = useMemo(() => {
    const dataToSort = searchResults != null ? searchResults : tableData;
    return dataToSort.sort((a, b) => {
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
  }, [sortKey, sortOrder, searchResults, tableData]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

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
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search here..."
            className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-9 w-full rounded-lg border border-gray-300 bg-transparent py-2 pr-9 pl-4 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
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
          {searchLoading && (
            <span className="ml-2 text-xs text-gray-500">Loading...</span>
          )}
          {searchError && (
            <span className="ml-2 text-xs text-red-500">Error</span>
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
              {currentData.map((item, i) => (
                <TableRow key={i}>
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
                        ) && <ViewActionButton onClick={() => onView(item)} />}
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
            onPageChange={handlePageChange}
          />
          <div className="pt-3 xl:pt-0">
            <p className="border-t border-gray-100 pt-3 text-center text-sm font-medium text-gray-500 xl:border-t-0 xl:pt-0 xl:text-left dark:border-gray-800 dark:text-gray-400">
              Showing {startIndex + 1} to {endIndex} of {totalItems} entries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
