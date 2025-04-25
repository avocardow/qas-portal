"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useRbac } from "@/context/RbacContext";
import { api } from "@/utils/api";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Notification from "@/components/ui/notification/Notification";
import useDebounce from "@/hooks/useDebounce";
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
  // Pagination, filtering state
  const [filter, setFilter] = useState("");
  // Debounce filter input to optimize queries
  const debouncedFilter = useDebounce(filter, 500);
  const [pageSize] = useState(10);

  // Fetch paginated data with current controls
  const clientsQuery = api.clients.getAll.useQuery(
    { take: pageSize, filter: debouncedFilter },
    {
      refetchOnWindowFocus: false,
      staleTime: 600000,
    }
  );

  const items = clientsQuery.data?.items;
  const isLoading = clientsQuery.isLoading;
  const error = clientsQuery.error;

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
          {/* Only Admin can create clients */}
          {role === "Admin" && (
            <Link href="/clients/new">
              <button className="btn bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500">
                Add New Client
              </button>
            </Link>
          )}
        </div>
      </div>
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-6">
        <ComponentCard title="Clients">
          {notification && (
            <Notification
              variant={notification.variant}
              title={notification.title}
              description={notification.description}
            />
          )}
          {isLoading && <p>Loading clients...</p>}
          {!items?.length && !isLoading && !error && <p>No clients found.</p>}
          {items && (
            <div className="custom-scrollbar max-w-full overflow-x-auto">
              <DataTableTwo
                data={items}
                columns={columns}
                hideDeleteIcon
                onView={(row: any) => router.push(`/clients/${row.id}`)}
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
