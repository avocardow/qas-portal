"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAbility } from "@/hooks/useAbility";
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
import Authorized from "@/components/Authorized";
import { CLIENT_PERMISSIONS } from "@/constants/permissions";

export default function ClientsPage() {
  const [notification, setNotification] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    description?: string;
  } | null>(null);
  const { can } = useAbility();
  const router = useRouter();
  // Assigned user filter state
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  // Fetch staff members for filter dropdown (fallback to empty list if undefined)
  const managersQuery = api.user?.getAssignableManagers?.useQuery?.() ?? { data: [] };
  const managers = managersQuery.data ?? [];
  // --- Pagination and Filter State ---
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'prospect' | 'archived' | 'all'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<
    "clientName" |
    "nextContactDate" |
    "auditPeriodEndDate" |
    "estAnnFees" |
    "status" |
    "auditStageName" |
    "assignedUser"
  >("clientName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // --- End Pagination and Filter State ---

  const utils = api.useUtils(); // Get tRPC utils for pre-fetching

  // Fetch paginated data with current controls
  const showAll = selectedStatus === 'all';
  const statusFilter: "active" | "prospect" | "archived" | undefined =
    showAll ? undefined : (selectedStatus as "active" | "prospect" | "archived");
  // Map assignedFilter to API param: undefined = all, null = unassigned, or uuid
  const assignedUserIdFilter = assignedFilter === 'all'
    ? undefined
    : assignedFilter === 'unassigned'
      ? null
      : assignedFilter;
  const clientsQuery = api.clients.getAll.useQuery(
    {
      page: currentPage,
      pageSize: pageSize,
      showAll,
      statusFilter,
      filter: debouncedSearchTerm,
      sortBy,
      sortOrder,
      assignedUserId: assignedUserIdFilter,
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
        key: "assignedUser",
        header: "Staff Assigned",
        sortable: true,
        cell: (row: any) => row.assignedUser?.name ?? "Unassigned",
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
        key: "auditPeriodEndDate",
        header: "Audit Period End",
        sortable: true,
        cell: (row: any) =>
          row.auditPeriodEndDate
            ? new Date(row.auditPeriodEndDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
              })
            : "-",
      },
    ],
    []
  );

  // Permission-based admin columns
  const adminColumns = React.useMemo<ColumnDef[]>(
    () => [
      {
        key: "status",
        header: "Status",
        sortable: true,
        cell: (row: any) => {
          const status = String(row.status).toLowerCase();
          let color: "success" | "warning" | "error" | "info" | "primary" | "dark" | "light" = "info";
          switch (status) {
            case "active":
              color = "success";
              break;
            case "archived":
              color = "light";
              break;
            case "prospect":
              color = "primary";
              break;
            default:
              color = "info";
          }
          return (
            <Authorized action={CLIENT_PERMISSIONS.VIEW_STATUS} fallback="-">
              <Badge size="sm" variant="light" color={color}>
                {row.status}
              </Badge>
            </Authorized>
          );
        },
        permission: CLIENT_PERMISSIONS.VIEW_STATUS,
      },
    ],
    []
  );

  // Compose columns: include only columns the user has permission to view
  const columns: ColumnDef[] = React.useMemo(() => {
    const filteredAdmin = adminColumns.filter(
      (col) => !col.permission || can(col.permission)
    );
    return [...baseColumns, ...filteredAdmin];
  }, [baseColumns, adminColumns, can]);

  // Reset sorting if it refers to unauthorized columns
  useEffect(() => {
    if (!can(CLIENT_PERMISSIONS.VIEW_BILLING) && sortBy === 'estAnnFees') {
      setSortBy('clientName');
      setSortOrder('asc');
    }
    if (!can(CLIENT_PERMISSIONS.VIEW_STATUS) && sortBy === 'status') {
      setSortBy('clientName');
      setSortOrder('asc');
    }
  }, [can, sortBy, setSortBy, setSortOrder]);

  // Reset status filter to 'active' if user cannot view Status
  useEffect(() => {
    if (!can(CLIENT_PERMISSIONS.VIEW_STATUS) && selectedStatus !== 'active') {
      setSelectedStatus('active');
      setCurrentPage(1);
    }
  }, [can, selectedStatus]);

  // Protect view based on permission checks using useAbility
  if (
    !can(CLIENT_PERMISSIONS.VIEW) &&
    !can(CLIENT_PERMISSIONS.VIEW_BILLING) &&
    !can(CLIENT_PERMISSIONS.VIEW_STATUS)
  ) {
    return <p>You are not authorized to view clients.</p>;
  }

  return (
    <div className="overflow-x-hidden">
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-6">
        <ComponentCard
          title="Client Directory"
          actions={
            <Authorized action={CLIENT_PERMISSIONS.VIEW_BILLING}
              fallback={
                <Button
                  aria-label="Add New Client"
                  size="sm"
                  variant="outline"
                  disabled
                  title="Insufficient permissions"
                >
                  Add New Client
                </Button>
              }
            >
              <Button
                aria-label="Add New Client"
                size="sm"
                variant="outline"
                onClick={() => router.push('/clients/new')}
              >
                Add New Client
              </Button>
            </Authorized>
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
                      | "auditPeriodEndDate"
                      | "estAnnFees"
                      | "status"
                      | "auditStageName"
                      | "assignedUser"
                  );
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                extraControls={
                  <>
                    {can(CLIENT_PERMISSIONS.VIEW_STATUS) && (
                      <select
                        id="client-status-select"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value as 'active' | 'prospect' | 'archived' | 'all');
                          setCurrentPage(1);
                        }}
                        className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-9 rounded-lg border border-gray-300 bg-transparent py-2 pr-8 pl-3 text-sm text-gray-800 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="active">Active Clients</option>
                        <option value="archived">Archived Clients</option>
                        <option value="prospect">Prospective Clients</option>
                        <option value="all">All Clients</option>
                      </select>
                    )}
                    {/* Assigned user filter dropdown */}
                    <select
                      id="client-assigned-filter"
                      value={assignedFilter}
                      onChange={(e) => { setAssignedFilter(e.target.value); setCurrentPage(1); }}
                      className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-9 rounded-lg border border-gray-300 bg-transparent py-2 pr-8 pl-3 text-sm text-gray-800"
                    >
                      <option value="all">All Assignments</option>
                      <option value="unassigned">Unassigned</option>
                      {managers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name ?? u.email}
                        </option>
                      ))}
                    </select>
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