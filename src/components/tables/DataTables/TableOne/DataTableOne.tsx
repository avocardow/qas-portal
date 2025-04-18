"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { AngleDownIcon, AngleUpIcon } from "@/icons";
import Image from "next/image";
import PaginationWithIcon from "./PaginationWithIcon";

const tableRowData = [
  {
    id: 1,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
    },
    position: "Sales Assistant",
    location: "Edinburgh",
    age: 57,
    date: "25 Apr, 2027",
    salary: "$89,500",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Charlotte Anderson",
    },
    position: "Marketing Manager",
    location: "London",
    age: 42,
    date: "12 Mar, 2025",
    salary: "$105,000",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-22.jpg",
      name: "Ethan Brown",
    },
    position: "Software Engineer",
    location: "San Francisco",
    age: 30,
    date: "01 Jan, 2024",
    salary: "$120,000",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-23.jpg",
      name: "Sophia Martinez",
    },
    position: "Product Manager",
    location: "New York",
    age: 35,
    date: "15 Jun, 2026",
    salary: "$95,000",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-24.jpg",
      name: "James Wilson",
    },
    position: "Data Analyst",
    location: "Chicago",
    age: 28,
    date: "20 Sep, 2025",
    salary: "$80,000",
  },
  {
    id: 6,
    user: {
      image: "/images/user/user-25.jpg",
      name: "Olivia Johnson",
    },
    position: "HR Specialist",
    location: "Los Angeles",
    age: 40,
    date: "08 Nov, 2026",
    salary: "$75,000",
  },
  {
    id: 7,
    user: {
      image: "/images/user/user-26.jpg",
      name: "William Smith",
    },
    position: "Financial Analyst",
    location: "Seattle",
    age: 38,
    date: "03 Feb, 2026",
    salary: "$88,000",
  },
  {
    id: 8,
    user: {
      image: "/images/user/user-27.jpg",
      name: "Isabella Davis",
    },
    position: "UI/UX Designer",
    location: "Austin",
    age: 29,
    date: "18 Jul, 2025",
    salary: "$92,000",
  },
  {
    id: 9,
    user: {
      image: "/images/user/user-28.jpg",
      name: "Liam Moore",
    },
    position: "DevOps Engineer",
    location: "Boston",
    age: 33,
    date: "30 Oct, 2024",
    salary: "$115,000",
  },
  {
    id: 10,
    user: {
      image: "/images/user/user-29.jpg",
      name: "Mia Garcia",
    },
    position: "Content Strategist",
    location: "Denver",
    age: 27,
    date: "12 Dec, 2027",
    salary: "$70,000",
  },
];

type SortKey = "name" | "position" | "location" | "age" | "date" | "salary";
type SortOrder = "asc" | "desc";

export default function DataTableOne() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAndSortedData = useMemo(() => {
    return tableRowData
      .filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (sortKey === "name") {
          return sortOrder === "asc"
            ? a.user.name.localeCompare(b.user.name)
            : b.user.name.localeCompare(a.user.name);
        }
        if (sortKey === "salary") {
          const salaryA = Number.parseInt(a[sortKey].replace(/\$|,/g, ""));
          const salaryB = Number.parseInt(b[sortKey].replace(/\$|,/g, ""));
          return sortOrder === "asc" ? salaryA - salaryB : salaryB - salaryA;
        }
        return sortOrder === "asc"
          ? String(a[sortKey]).localeCompare(String(b[sortKey]))
          : String(b[sortKey]).localeCompare(String(a[sortKey]));
      });
  }, [sortKey, sortOrder, searchTerm]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: SortKey) => {
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
      <div className="flex flex-col gap-2 rounded-t-xl border border-b-0 border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400"> Show </span>
          <div className="relative z-20 bg-transparent">
            <select
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 focus:ring-3 focus:outline-hidden h-9 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none py-2 pl-3 pr-8 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
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
            <span className="absolute right-2 top-1/2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
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
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400"> entries </span>
        </div>

        <div className="relative">
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
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
                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill=""
              />
            </svg>
          </button>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 focus:ring-3 focus:outline-hidden h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div>
          <Table>
            <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {[
                  { key: "name", label: "User" },
                  { key: "position", label: "Position" },
                  { key: "location", label: "Office" },
                  { key: "age", label: "Age" },
                  { key: "date", label: "Start Date" },
                  { key: "salary", label: "Salary" },
                ].map(({ key, label }) => (
                  <TableCell
                    key={key}
                    isHeader
                    className="border border-gray-100 px-4 py-3 dark:border-white/[0.05]"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => handleSort(key as SortKey)}
                    >
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                        {label}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, i) => (
                <TableRow key={i + 1}>
                  <TableCell className="whitespace-nowrap border border-gray-100 px-4 py-3 dark:border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="size-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={item.user.image || "/placeholder.svg"}
                          alt="user"
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {item.user.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-sm whitespace-nowrap border border-gray-100 px-4 py-3 font-normal text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.position}
                  </TableCell>
                  <TableCell className="text-theme-sm whitespace-nowrap border border-gray-100 px-4 py-3 font-normal text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.location}
                  </TableCell>
                  <TableCell className="text-theme-sm whitespace-nowrap border border-gray-100 px-4 py-3 font-normal text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.age}
                  </TableCell>
                  <TableCell className="text-theme-sm whitespace-nowrap border border-gray-100 px-4 py-3 font-normal text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.date}
                  </TableCell>
                  <TableCell className="text-theme-sm whitespace-nowrap border border-gray-100 px-4 py-3 font-normal text-gray-800 dark:border-white/[0.05] dark:text-gray-400/90">
                    {item.salary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
          {/* Left side: Showing entries */}
          <div className="pb-3 xl:pb-0">
            <p className="border-b border-gray-100 pb-3 text-center text-sm font-medium text-gray-500 xl:border-b-0 xl:pb-0 xl:text-left dark:border-gray-800 dark:text-gray-400">
              Showing {startIndex + 1} to {endIndex} of {totalItems} entries
            </p>
          </div>
          <PaginationWithIcon
            totalPages={totalPages}
            initialPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
