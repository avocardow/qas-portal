/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";
import React, { useState } from "react";
import { useRbac } from "@/context/RbacContext";
import { useRouter } from "next/navigation";
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
import useDebounce from "@/hooks/useDebounce";

// Add type for sortable fields
type SortField = "name" | "city" | "status";

export default function ContactsPage() {
  // RBAC context
  const { role } = useRbac();
  // Pagination, sorting, filtering state
  const [filter, setFilter] = useState("");
  // Debounce filter input to optimize queries
  const debouncedFilter = useDebounce(filter, 500);
  const router = useRouter();
  const deleteContactMutation = api.contact.deleteContact.useMutation();
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageSize] = useState(10);
  const [cursors, setCursors] = useState<(string | undefined)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [pageIndex, setPageIndex] = useState(0);
  // Protect view based on role
  if (role !== "Admin" && role !== "Manager" && role !== "Client") {
    return <p>You are not authorized to view contacts.</p>;
  }

  // Fetch paginated data with current controls
  const contactsQuery = api.contact.getAll.useQuery({
    take: pageSize,
    cursor: currentCursor,
    filter: debouncedFilter,
    sortBy,
    sortOrder,
  });
  const items = contactsQuery.data?.items;
  const nextCursor = contactsQuery.data?.nextCursor;
  const isLoading = contactsQuery.isLoading;
  const error = contactsQuery.error;

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
            placeholder="Search contacts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          />
          {/* Conditional Add New Contact button */}
          {/* Only Admin can create contacts */}
          {role === "Admin" && (
            <Link href="/contacts/new">
              <button className="btn bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500">
                Add New Contact
              </button>
            </Link>
          )}
        </div>
        <div className="space-x-2">
          <button
            onClick={handlePrev}
            disabled={pageIndex === 0}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={!nextCursor}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>
      <PageBreadcrumb pageTitle="Contacts" />
      <div className="space-y-6">
        <ComponentCard title="Contacts">
          {isLoading && <p>Loading contacts...</p>}
          {error && (
            <p className="text-red-500">
              Error loading contacts: {error.message}
            </p>
          )}
          {!items?.length && !isLoading && !error && <p>No contacts found.</p>}
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
                        onClick={() => toggleSort("name")}
                        className="w-full text-left"
                      >
                        Name{" "}
                        {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
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
                    <TableCell
                      isHeader
                      className="text-gray-800 dark:text-gray-100"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {items.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {contact.id}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        <Link href={`/contacts/${contact.id}`}>
                          {contact.name || "-"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {contact.city ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {contact.status}
                      </TableCell>
                      {/* Only Admin can edit or delete contacts */}
                      {role === "Admin" && (
                        <TableCell className="space-x-2 text-gray-700 dark:text-gray-200">
                          <Link href={`/contacts/${contact.id}/edit`}>
                            <button className="btn bg-blue-500 text-white hover:bg-blue-600">
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this contact?"
                                )
                              ) {
                                deleteContactMutation.mutate(
                                  { contactId: contact.id },
                                  {
                                    onSuccess: () => router.refresh(),
                                    onError: console.error,
                                  }
                                );
                              }
                            }}
                            disabled={
                              deleteContactMutation.status === "pending"
                            }
                            className="btn bg-red-500 text-white hover:bg-red-600"
                          >
                            {deleteContactMutation.status === "pending"
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </TableCell>
                      )}
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
