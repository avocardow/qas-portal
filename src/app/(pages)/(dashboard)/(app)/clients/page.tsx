"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// Add type for sortable fields
type SortField = "clientName" | "city" | "status";

export default function ClientsPage() {
  // Session for RBAC
  const { data: session } = useSession();
  // Pagination, sorting, filtering state
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("clientName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageSize] = useState(10);
  const [cursors, setCursors] = useState<(string | undefined)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [pageIndex, setPageIndex] = useState(0);

  // Fetch paginated data with current controls
  const clientsQuery = api.client.getAll.useQuery({
    take: pageSize,
    cursor: currentCursor,
    filter,
    sortBy,
    sortOrder,
  });
  const items = clientsQuery.data?.items;
  const nextCursor = clientsQuery.data?.nextCursor;
  const isLoading = clientsQuery.isLoading;
  const error = clientsQuery.error;

  // Handlers for pagination and sorting
  const handleNext = () => {
    if (nextCursor) {
      setCursors((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
      setPageIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      const prevCursors = [...cursors];
      const prev = prevCursors.pop();
      setCursors(prevCursors);
      setCurrentCursor(prev);
      setPageIndex((idx) => idx - 1);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    // reset pagination
    setCursors([]);
    setCurrentCursor(undefined);
    setPageIndex(0);
  };

  return (
    <div>
      {/* Filter, Add New, and pagination controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search clients..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          />
          {/* Conditional Add New Client button */}
          {session?.user?.role &&
            ["Admin", "Manager"].includes(session.user.role) && (
              <Link href="/clients/new">
                <button className="btn bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                  Add New Client
                </button>
              </Link>
            )}
        </div>
        <div className="space-x-2">
          <button
            onClick={handlePrev}
            disabled={pageIndex === 0}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={!nextCursor}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-6">
        <ComponentCard title="Clients">
          {isLoading && <p>Loading...</p>}
          {error && <p>Error loading clients.</p>}
          {!items?.length && !isLoading && !error && <p>No clients found.</p>}
          {items && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="text-gray-800 dark:text-gray-100"
                    >
                      ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer text-gray-800 dark:text-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort("clientName")}
                        className="w-full text-left"
                      >
                        Name{" "}
                        {sortBy === "clientName" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </button>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer text-gray-800 dark:text-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort("city")}
                        className="w-full text-left"
                      >
                        City{" "}
                        {sortBy === "city" && (sortOrder === "asc" ? "↑" : "↓")}
                      </button>
                    </TableCell>
                    <TableCell
                      isHeader
                      className="cursor-pointer text-gray-800 dark:text-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort("status")}
                        className="w-full text-left"
                      >
                        Status{" "}
                        {sortBy === "status" &&
                          (sortOrder === "asc" ? "↑" : "↓")}
                      </button>
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {items.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {client.id}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        <Link href={`/clients/${client.id}`}>
                          {client.clientName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {client.city ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {client.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
