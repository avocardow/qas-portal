"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useRbac } from "@/context/RbacContext";
import { api } from "@/utils/api";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Notification from "@/components/ui/notification/Notification";
import DataTableTwo, {
  ColumnDef,
} from "@/components/tables/DataTables/TableTwo/DataTableTwo";
import Badge from "@/components/ui/badge/Badge";
import { useRouter } from "next/navigation";

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
  const [pageSize] = useState(10);
  // --- End Pagination and Filter State ---

  const utils = api.useUtils(); // Get tRPC utils for pre-fetching

  // Fetch paginated data with current controls
  const statusFilter = showAll ? undefined : "active";
  const clientsQuery = api.clients.getAll.useQuery(
    {
      page: currentPage,
      pageSize: pageSize,
      showAll,
      statusFilter,
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
      const queryInput = { pageSize, showAll, statusFilter };

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
  ]);
  // --- End Pre-fetching Logic ---

  // Handler for page changes from DataTableTwo
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  // Base column definitions for Clients table (memoized)
  const baseColumns = React.useMemo<ColumnDef[]>(
    () => [
      {
        key: "clientName",
        header: "Client Name",
        sortable: true,
        cell: (row: any) => {
          const name = row.clientName || "";
          const display = name.length > 25 ? `${name.slice(0, 25)}…` : name;
          return (
            <Link
              href={`/clients/${row.id}`}
              className="block max-w-[200px] truncate"
            >
              {display}
            </Link>
          );
        },
      },
      {
        key: "primaryContact",
        header: "Primary Contact",
        cell: (row: any) =>
          row.contacts?.find((c: any) => c.isPrimary)?.name ?? "-",
      },
      { key: "city", header: "City", sortable: true },
      {
        key: "nextContactDate",
        header: "Next Contact Date",
        sortable: true,
        cell: (row: any) =>
          row.nextContactDate
            ? new Date(row.nextContactDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "-",
      },
      {
        key: "auditMonthEnd",
        header: "Audit Month End",
        sortable: true,
        cell: (row: any) =>
          row.auditMonthEnd
            ? new Intl.DateTimeFormat("default", { month: "short" }).format(
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
    <div>
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-6">
        <ComponentCard
          title="Clients"
          actions={
            role === "Admin" && (
              <Link href="/clients/new">
                <button className="btn bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500">
                  Add New Client
                </button>
              </Link>
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
            <div className="custom-scrollbar max-w-full overflow-x-auto">
              <DataTableTwo
                data={items}
                isLoading={isLoading}
                columns={columns}
                totalDbEntries={totalDbEntries}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onView={(row: any) => router.push(`/clients/${row.id}`)}
                extraControls={
                  <>
                    {role === "Admin" && (
                      <label className="inline-flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={showAll}
                          onChange={() => setShowAll((prev) => !prev)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span>Show All</span>
                      </label>
                    )}
                    {role === "Admin" && (
                      <Badge size="sm" color={showAll ? "info" : "success"}>
                        {showAll ? "All Clients" : "Active Clients"}
                      </Badge>
                    )}
                  </>
                }
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
