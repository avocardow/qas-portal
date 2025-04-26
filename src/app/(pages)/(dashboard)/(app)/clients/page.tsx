"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useRbac } from "@/context/RbacContext";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Notification from "@/components/ui/notification/Notification";
import DataTableTwo, {
  ColumnDef,
} from "@/components/tables/DataTables/TableTwo/DataTableTwo";
import Badge from "@/components/ui/badge/Badge";
import useDebounce from "@/hooks/useDebounce";
import Button from "@/components/ui/button/Button";

export default function ClientsPage() {
  const [notification, setNotification] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    description?: string;
  } | null>(null);
  // RBAC context
  const { role } = useRbac();
  const router = useRouter();
  // --- Pagination and Filter State ---
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<
    "clientName" |
    "nextContactDate" |
    "auditMonthEnd" |
    "estAnnFees" |
    "status" |
    "auditStageName"
  >("clientName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // --- End Pagination and Filter State ---

  const utils = api.useUtils(); // Get tRPC utils for pre-fetching

  // Fetch paginated data with current controls
  const statusFilter: "active" | "prospect" | "archived" | undefined = showAll
    ? undefined
    : "active";
  const clientsQuery = api.clients.getAll.useQuery(
    {
      page: currentPage,
      pageSize: pageSize,
      showAll,
      statusFilter,
      filter: debouncedSearchTerm,
      sortBy,
      sortOrder,
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 600000,
    }
  );

  // Extract items, totalCount, and loading state
  const items = clientsQuery.data?.items;
  const totalDbEntries = clientsQuery.data?.totalCount;
  const isLoading = clientsQuery.isLoading;
  const error = clientsQuery.error;

  // --- Pre-fetching Logic ---
  useEffect(() => {
    if (clientsQuery.data && totalDbEntries) {
      const totalPages = Math.ceil(totalDbEntries / pageSize);
      const queryInput = {
        pageSize,
        showAll,
        statusFilter,
        filter: debouncedSearchTerm,
        sortBy,
        sortOrder,
      };

      // Prefetch next page
      if (currentPage < totalPages) {
        utils.clients.getAll.prefetch({ ...queryInput, page: currentPage + 1 });
      }
      // Prefetch previous page
      if (currentPage > 1) {
        utils.clients.getAll.prefetch({ ...queryInput, page: currentPage - 1 });
      }
    }
  }, [
    currentPage,
    pageSize,
    showAll,
    statusFilter,
    totalDbEntries,
    clientsQuery.data,
    utils,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
  ]);
  // --- End Pre-fetching Logic ---

  // Handler for page changes from DataTableTwo
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // --- Search Result Handling ---
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);
  // --- End Search Result Handling ---

  useEffect(() => {
    if (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      setNotification({
        variant: "error",
        title: "Error loading clients",
        description: errMsg,
      });
    }
  }, [error]);

  // Maximum length for client names before truncation
  const MAX_CLIENT_NAME_LENGTH = 60;

  // Base column definitions for Clients table (memoized)
  const baseColumns = React.useMemo<ColumnDef[]>(
    () => [
      {
        key: "clientName",
        header: "Client Name",
        sortable: true,
        cell: (row: any) => {
          const name = row.clientName ?? "-";
          return name.length > MAX_CLIENT_NAME_LENGTH
            ? name.slice(0, MAX_CLIENT_NAME_LENGTH) + "..."
            : name;
        },
      },
      {
        key: "primaryContact",
        header: "Primary Contact",
        sortable: false,
        cell: (row: any) =>
          row.contacts?.find((c: any) => c.isPrimary)?.name ?? "-",
      },
      {
        key: "auditStageName",
        header: "Audit Stage",
        sortable: true,
        cell: (row: any) => row.audits?.[0]?.stage?.name ?? "-",
      },
      {
        key: "nextContactDate",
        header: "Next Contact",
        sortable: true,
        cell: (row: any) =>
          row.nextContactDate
            ? new Date(row.nextContactDate).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "-",
      },
      {
        key: "auditMonthEnd",
        header: "Audit End",
        sortable: true,
        cell: (row: any) =>
          row.auditMonthEnd
            ? new Intl.DateTimeFormat("default", { month: "long" }).format(
                new Date(2000, row.auditMonthEnd - 1)
              )
            : "-",
      },
    ],
    []
  );

  // Configure columns for DataTableTwo using baseColumns
  const columns: ColumnDef[] = React.useMemo(() => {
    const cols = [...baseColumns];
    if (role === "Admin") {
      cols.push({
        key: "estAnnFees",
        header: "Fees",
        sortable: true,
        cell: (row: any) =>
          row.estAnnFees != null
            ? new Intl.NumberFormat("en-AU", {
                style: "currency",
                currency: "AUD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(row.estAnnFees)
            : "-",
      });
      cols.push({
        key: "status",
        header: "Status",
        sortable: true,
        cell: (row: any) => {
          let color: "success" | "warning" | "error" | "info" = "info";
          switch (row.status) {
            case "Active":
              color = "success";
              break;
            case "Pending":
              color = "warning";
              break;
            case "Inactive":
              color = "error";
              break;
            default:
              color = "info";
          }
          return (
            <Badge size="sm" variant="solid" color={color}>
              {row.status}
            </Badge>
          );
        },
      });
    }
    return cols;
  }, [role, baseColumns]);

  // Protect view based on role after hooks to keep hook order consistent
  if (role !== "Admin" && role !== "Manager" && role !== "Client") {
    return <p>You are not authorized to view clients.</p>;
  }

  return (
    <div className="overflow-x-hidden">
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-6">
        <ComponentCard
          title="Client Directory"
          actions={
            role === "Admin" && (
              <Button
                aria-label="Add New Client"
                size="sm"
                variant="outline"
                onClick={() => router.push('/clients/new')}
              >
                Add New Client
              </Button>
            )
          }
        >
          {notification && (
            <Notification
              variant={notification.variant}
              title={notification.title}
              description={notification.description}
            />
          )}
          {!items?.length && !isLoading && !error && <p>No clients found.</p>}
          {(items || isLoading) && (
            <div className="custom-scrollbar w-full overflow-x-auto">
              <DataTableTwo
                data={items}
                isLoading={isLoading}
                columns={columns}
                totalDbEntries={totalDbEntries}
                currentPage={currentPage}
                pageSize={pageSize}
                onItemsPerPageChange={(size) => {
                  // Cap pageSize to available entries
                  const newSize = typeof totalDbEntries === 'number'
                    ? Math.min(size, totalDbEntries)
                    : size;
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                onPageChange={handlePageChange}
                onRowClick={(row) => router.push(`/clients/${row.id}`)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                serverSide
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(key, order) => {
                  setSortBy(
                    key as
                      | "clientName"
                      | "nextContactDate"
                      | "auditMonthEnd"
                      | "estAnnFees"
                      | "status"
                      | "auditStageName"
                  );
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                extraControls={
                  <>
                    {role === "Admin" && (
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={showAll}
                          onChange={() => setShowAll((prev) => !prev)}
                          className="form-checkbox h-5 w-5 text-blue-500 dark:text-blue-400 focus:ring-blue-300 dark:focus:ring-blue-600"
                        />
                        <span>Show All</span>
                      </label>
                    )}
                    {role === "Admin" && (
                      <Badge
                        size="sm"
                        variant={showAll ? "light" : "solid"}
                        color={showAll ? "primary" : "success"}
                      >
                        {showAll ? "All Clients" : "Active Clients"}
                      </Badge>
                    )}
                  </>
                }
              />
            </div>
          )}
          {debouncedSearchTerm && (
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Showing results for: &quot;{debouncedSearchTerm}&quot;
            </p>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}