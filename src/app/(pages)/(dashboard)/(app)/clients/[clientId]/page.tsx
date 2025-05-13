"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from '@/components/ui/badge/Badge';
import ComponentCard from "@/components/common/ComponentCard";
import ClientContactsSection from '@/components/clients/ClientContactsSection';
import ClientTrustAccountsSection from '@/components/clients/ClientTrustAccountsSection';
import { useClientData } from "@/hooks/useClientData";
import { ActivityLogType } from '@prisma/client';
import ErrorFallback from "@/components/common/ErrorFallback";
import Authorized from '@/components/Authorized';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import CurrentAuditCard from '@/components/audit/CurrentAuditCard';
import ActivityLogTimeline from '@/components/clients/ActivityLogTimeline';
import { InfoIcon, PlusIcon } from '@/icons';
import PaginationWithIcon from '@/components/ui/pagination/PaginationWithIcon';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import AddActivityModal from '@/components/clients/AddActivityModal';
import { api } from '@/utils/api';
import type { RouterOutput } from "@/utils/api";
import Popover from '@/components/ui/popover/Popover';
import { useAbility } from '@/hooks/useAbility';
import ModalTwo from '@/components/ui/modal/ModalTwo';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/ui/button/Button';
import { TrashBinIcon as ArchiveIcon } from '@/icons';
import Notification from '@/components/ui/notification/Notification';
import EditClientModal from '@/components/clients/EditClientModal';
import DateRangePicker from '@/components/form/DateRangePicker';
import AddAuditModal, { AddAuditFormData } from '@/components/audit/AddAuditModal';

export default function ClientDetailPage() {
  const params = (useParams() as { clientId: string }) || {};
  const clientId = params.clientId;
  const { can } = useAbility();
  const { isOpen: isAddActivityOpen, openModal: openAddActivityModal, closeModal: closeAddActivityModal } = useModal();
  const canEditClient = can(CLIENT_PERMISSIONS.EDIT);
  const utils = api.useContext();
  const [activityError, setActivityError] = useState<string | null>(null);
  const [nextAuditInitialValues, setNextAuditInitialValues] = useState<Partial<AddAuditFormData> | null>(null);
  const [isAddAuditOpen, setIsAddAuditOpen] = useState<boolean>(false);
  useEffect(() => {
    if (isAddActivityOpen) setActivityError(null);
  }, [isAddActivityOpen]);

  const addActivityMutation = api.clients.addActivityLog.useMutation({
    onMutate: async (newLog) => {
      await utils.clients.getById.cancel({ clientId });
      const previousData = utils.clients.getById.getData({ clientId });
      utils.clients.getById.setData({ clientId }, (old) => {
        if (!old) return old;
        const optimisticEntry = {
          id: 'temp-' + Date.now(),
          type: newLog.type as ActivityLogType,
          content: newLog.content,
          createdAt: newLog.date ?? new Date(),
        };
        return { ...old, activityLogs: [optimisticEntry, ...(old.activityLogs ?? [])] };
      });
      return { previousData };
    },
    onError: (err, newLog, context) => {
      if (context?.previousData) {
        utils.clients.getById.setData({ clientId }, context.previousData);
      }
      setActivityError(err instanceof Error ? err.message : 'Failed to add activity');
    },
    onSuccess: () => {
      void utils.clients.getById.invalidate({ clientId });
      closeAddActivityModal();
    }
  });
  const archiveMutation = api.clients.archive.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ clientId });
    },
    onError: (error: unknown) => {
      Notification({ variant: 'error', title: error instanceof Error ? error.message : 'Failed to archive client' });
    },
  });
  // TODO: ensure the server-side API enforces clients.archive permission; do not rely solely on frontend gating

  // Fetch client data using custom hook; prevent query when clientId is missing
  const { data: _clientData, isLoading, isError, error } = useClientData(clientId, { enabled: Boolean(clientId) });
  // Cast raw data to typed ClientById for proper property inference
  type ClientById = RouterOutput["clients"]["getById"];
  const clientData = _clientData as ClientById | undefined;
  const activityLogs = useMemo(
    () => clientData?.activityLogs ?? [],
    [clientData?.activityLogs]
  );

  // Calculate next contact and report due dates
   
  const nextContactDate = useMemo(() => {
    return clientData?.nextContactDate ?? null;
  }, [clientData?.nextContactDate]);

  // Helper to format dates as 'Weekday, DD Month, YYYY'
  const formatAUDate = (date: Date) =>
    `${date.toLocaleDateString('en-AU', { weekday: 'long' })}, ${date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;

  // State for filters and pagination
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [logPage, setLogPage] = useState(1);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  const toggleActionsDropdown = useCallback(() => {
    setIsActionsDropdownOpen(prev => !prev);
  }, []);

  const closeActionsDropdown = useCallback(() => {
    setIsActionsDropdownOpen(false);
  }, []);

  const handleNewActivityItem = useCallback(() => {
    closeActionsDropdown();
    openAddActivityModal();
  }, [closeActionsDropdown, openAddActivityModal]);

  // Default date range for filters: oldest log to today
  useEffect(() => {
    if (activityLogs.length > 0) {
      const times = activityLogs.map((entry) => new Date(entry.createdAt).getTime());
      const oldest = new Date(Math.min(...times));
      setStartDate(oldest.toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
      setLogPage(1);
    }
  }, [activityLogs]);

  const title = clientData?.clientName ?? ("Client " + clientId);
  
  // Activity log filtering setup
  const tabs = [
    { label: 'All', type: 'all' },
    { label: 'Notes', type: 'note' },
    { label: 'Emails', type: 'email' },
    { label: 'Calls', type: 'call' },
    { label: 'Documents', type: 'document' },
    { label: 'Tasks', type: 'task' },
  ];
  const filteredLogs = useMemo(() => {
    // Define activity type groups inside memo to avoid unstable external reference
    const ACTIVITY_TYPE_GROUPS: Record<string, string[]> = {
      note: ['note'],
      email: ['email_sent', 'email_received'],
      call: ['call_in', 'call_out'],
      statusUpdate: ['status_change', 'stage_change', 'client_assigned', 'audit_assigned'],
      document: ['document_request', 'document_received', 'document_signed'],
      task: ['task_created', 'task_completed'],
    };
    let logs = activityLogs;
    if (filterType !== 'all') {
      const types = ACTIVITY_TYPE_GROUPS[filterType] ?? [];
      logs = logs.filter((entry) => types.includes(entry.type));
    }
    if (startDate) {
      logs = logs.filter((entry) => {
        const entryDateStr = new Date(entry.createdAt).toISOString().split('T')[0];
        return entryDateStr >= startDate;
      });
    }
    if (endDate) {
      logs = logs.filter((entry) => {
        const entryDateStr = new Date(entry.createdAt).toISOString().split('T')[0];
        return entryDateStr <= endDate;
      });
    }
    return logs;
  }, [activityLogs, filterType, startDate, endDate]);
  const logsPerPage = 5;
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);
  const pagedLogs = useMemo(() => {
    // Sort logs descending (newest first) before pagination
    const sortedLogs = [...filteredLogs].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);
  }, [filteredLogs, logPage, logsPerPage]);
  const latestBillingCommentary = useMemo(() => {
    if (!clientData?.activityLogs) return null;
    return [...clientData.activityLogs]
      .filter((log) => log.type === ActivityLogType.billing_commentary)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  }, [clientData?.activityLogs]);
  const latestExternalInstructions = useMemo(() => {
    if (!clientData?.activityLogs) return null;
    return [...clientData.activityLogs]
      .filter((log) => log.type === ("external_folder_instructions" as ActivityLogType))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  }, [clientData?.activityLogs]);
  // Primary email for mailto link
  const primaryEmail = clientData?.email ?? clientData?.contacts.find((c) => c.isPrimary)?.email;
  
  // Validate clientId parameter after hooks
  if (!clientId) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Invalid client ID.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-brand-500 border-gray-200" />
        </div>
      </DashboardPlaceholderPageTemplate>
    );
  }
  
  // Handle error state
  if (isError) {
    return <ErrorFallback message={error?.message} />;
  }

  return (
    <Authorized action={CLIENT_PERMISSIONS.VIEW} fallback={
      <DashboardPlaceholderPageTemplate heading="Access Denied">
        <p>You do not have permission to view this page.</p>
      </DashboardPlaceholderPageTemplate>
    }>
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{clientData?.clientName}</h2>
          {clientData?.status && (
            <Badge size="sm" variant="light" color={
              clientData.status.toLowerCase() === 'active' ? 'success'
              : clientData.status.toLowerCase() === 'archived' ? 'light'
              : clientData.status.toLowerCase() === 'prospect' ? 'primary'
              : 'info'
            }>{clientData.status}</Badge>
          )}
        </div>
      <PageBreadcrumb
        pageTitle={title}
        items={[{ label: "Clients", href: "/clients" }]}
          hideTitle
      />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Overview */}
        <ComponentCard
          title="Client Overview"
          actions={
            canEditClient && <EditClientModal clientId={clientId} />
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <Authorized action={CLIENT_PERMISSIONS.VIEW_BILLING}>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Current Fees <span className="text-xs">(excl. GST)</span>:</span>
              <span>{clientData?.estAnnFees?.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) ?? '-'}</span>
              <Popover
                position="right"
                triggerOnHover
                trigger={<InfoIcon width={12} height={12} className="text-gray-400 cursor-pointer" />}
              >
                <div className="p-2">
                  {latestBillingCommentary ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {latestBillingCommentary.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No billing commentary available.</p>
                  )}
                </div>
              </Popover>
            </div>
          </Authorized>
            <div>
              <span className="font-medium">Next Contact Date:</span>{" "}
              {nextContactDate
                ? formatAUDate(nextContactDate)
                : "-"}
            </div>
            <div>
              <span className="font-medium">Audit Period End Date:</span>{" "}
              {clientData?.auditPeriodEndDate
                ? formatAUDate(new Date(clientData.auditPeriodEndDate))
                : "-"}
            </div>
            <div>
              <span className="font-semibold">Phone:</span>{" "}
              {clientData?.phone ?? clientData?.contacts.find((c) => c.isPrimary)?.phone ?? "-"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {primaryEmail ? (
                <a href={`mailto:${primaryEmail}`} className="text-blue-600 hover:underline">
                  {primaryEmail}
                </a>
              ) : "-"}
            </div>
            <div>
              <span className="font-semibold">Address:</span>{" "}
              {[clientData?.address, clientData?.city, clientData?.postcode]
                .filter(Boolean)
                .join(', ') || "-"}
            </div>
            <div>
              <span className="font-semibold">License:</span>{" "}
              {clientData?.licenses?.find((l) => l.isPrimary)?.licenseNumber ?? "-"}
            </div>
            <div>
              <span className="font-semibold">Client Manager:</span>{" "}
              {clientData?.assignedUser?.name ?? "Unassigned"}
            </div>
            <div className="flex items-baseline">
            <a
              href={clientData?.internalFolder ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme hover:underline"
            >
              Client Folder
            </a>
            <span
              className="mx-4 h-4 border-l border-gray-300 dark:border-gray-600"
              aria-hidden="true"
            />
            <div className="mt-4 flex items-start space-x-2">
              <a
                href={clientData?.externalFolder ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme hover:underline"
              >
                External Folder
              </a>
              <Popover
                position="right"
                triggerOnHover
                trigger={<InfoIcon width={12} height={12} className="text-gray-400 cursor-pointer" />}
              >
                <div className="p-2">
                  {latestExternalInstructions ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {latestExternalInstructions.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No external folder instructions available.
                    </p>
                  )}
                </div>
              </Popover>
            </div>
          </div>
          </div>
        </ComponentCard>

        {/* Activity Log Section styled as Activities card */}
        <ComponentCard
          title="Activities"
          className="lg:row-span-2"
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleNewActivityItem}
                className="p-2 text-gray-500 opacity-75 hover:text-gray-600 hover:opacity-100"
                aria-label="Add Activity Item"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <div className="relative">
                <button onClick={toggleActionsDropdown} className="dropdown-toggle">
                  <i className="fas fa-sliders h-5 w-5 text-gray-400 dark:text-gray-500"></i>
                </button>
                <Dropdown isOpen={isActionsDropdownOpen} onClose={closeActionsDropdown} className="w-56 p-2">
                  <div className="mb-2">
                    <DateRangePicker
                      id="activityDateRange"
                      label="Filter Activities"
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      onChange={([start, end]) => {
                        setStartDate(start);
                        setEndDate(end);
                        setLogPage(1);
                      }}
                    />
                  </div>
                </Dropdown>
              </div>
            </div>
          }
        >
          {/* Filter Tabs */}
          <div className="mb-4 overflow-x-auto">
            <nav className="min-w-full inline-flex whitespace-nowrap rounded-lg bg-gray-100 p-1 dark:bg-gray-900 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
              {tabs.map((tab) => (
                 <button
                   key={tab.type}
                   onClick={() => { setFilterType(tab.type); setLogPage(1); }}
                   className={`justify-center flex-grow-1 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                     filterType === tab.type
                       ? "shadow-theme-xs bg-white text-gray-900 dark:bg-white/[0.03] dark:text-white"
                       : "bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                   }`}
                 >
                   {tab.label}
                 </button>
              ))}
            </nav>
          </div>
          {/* Paginated Activity Log */}
          <ActivityLogTimeline
            entries={pagedLogs}
            contacts={clientData?.contacts.map(c => ({ id: c.id!, name: c.name })) ?? []}
            clientId={clientId}
          />
          {totalLogPages > 1 && (
            <div className="mt-4 overflow-x-auto">
              <PaginationWithIcon
                totalPages={totalLogPages}
                initialPage={1}
                onPageChange={setLogPage}
              />
            </div>
          )}
        </ComponentCard>

        {/* Current Audit moved below Activities with new onAfterSubmit callback */}
        <CurrentAuditCard
          clientId={clientId}
          onAfterSubmit={(formData) => {
            if (
              formData.lodgedWithOFTDate &&
              formData.invoiceIssueDate &&
              formData.invoicePaid &&
              formData.stageId === 4 &&
              formData.statusId === 10 &&
              formData.nextContactDate &&
              new Date(formData.nextContactDate) > new Date()
            ) {
              // Prepare initial values for new audit
              const nextYear = (formData.auditYear ?? new Date().getFullYear()) + 1;
              // Compute auditPeriodEndDate: add 1 year to existing auditPeriodEndDate
              let auditPeriodEndDate: string | undefined;
              if (formData.auditPeriodEndDate) {
                const [y, m, d] = formData.auditPeriodEndDate.split('-').map(Number);
                const dt = new Date(Date.UTC(y + 1, (m ?? 1) - 1, d));
                auditPeriodEndDate = dt.toISOString().split('T')[0];
              }
              // Compute reportDueDate: auditPeriodEndDate + 4 months, last day of month
              let reportDueDate: string | undefined;
              if (auditPeriodEndDate) {
                const [yy, mm, dd] = auditPeriodEndDate.split('-').map(Number);
                const base = new Date(Date.UTC(yy, mm - 1, dd));
                const due = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 5, 0));
                reportDueDate = due.toISOString().split('T')[0];
              }
              setNextAuditInitialValues({
                auditYear: nextYear,
                stageId: 1,
                statusId: 1,
                assignedUserId: "",
                auditPeriodEndDate,
                reportDueDate,
                lodgedWithOFTDate: undefined,
                invoiceIssueDate: undefined,
                invoicePaid: false,
                nextContactDate: formData.nextContactDate,
              });
              setIsAddAuditOpen(true);
            }
          }}
        />
        {/* AddAuditModal triggered after edit criteria met */}
        <AddAuditModal
          clientId={clientId}
          manualOpen={isAddAuditOpen}
          hideTrigger
          initialValues={nextAuditInitialValues ?? undefined}
          onAfterSubmit={() => {
            setIsAddAuditOpen(false);
            setNextAuditInitialValues(null);
          }}
          onModalClose={() => {
            setIsAddAuditOpen(false);
            setNextAuditInitialValues(null);
          }}
        />
        {/* Placeholder for Contacts */}
        <div className="lg:col-span-2">
          <ClientContactsSection contacts={clientData!.contacts} />
        </div>

        {/* Trust Accounts Section */}
        <div className="lg:col-span-2">
          <ClientTrustAccountsSection trustAccounts={clientData!.trustAccounts} />
        </div>
      </div>
      {/* Archive client button using danger modal */}
      <Authorized action={CLIENT_PERMISSIONS.ARCHIVE}>
        <div className="flex justify-start mt-6 mb-4">
        <ModalTwo
          trigger={
              <Button
                variant="link"
                className="text-gray-400 hover:text-red-600 hover:no-underline"
                startIcon={<ArchiveIcon className="h-4 w-4" />}
              >
                Archive Client
              </Button>
          }
          title="Archive Client"
          description="Are you sure you want to archive this client? This action cannot be undone."
          cancelLabel="Cancel"
          confirmLabel="Archive"
          onConfirm={() => archiveMutation.mutate({ clientId })}
          isLoading={archiveMutation.status === 'pending'}
        />
      </div>
      </Authorized>
    </div>
    <AddActivityModal
      clientId={clientId}
      isOpen={isAddActivityOpen}
      onClose={closeAddActivityModal}
      contacts={clientData?.contacts.map(c => ({ id: c.id!, name: c.name })) ?? []}
      onSubmit={async (data) => {
        setActivityError(null);
        try {
          await addActivityMutation.mutateAsync({
            clientId,
            contactId: data.contactId ?? undefined,
            type: data.type as ActivityLogType,
            content: data.description,
            date: new Date(data.date),
          });
        } catch {
          // error handled by onError
        }
      }}
      serverError={activityError}
    />
  </Authorized>
);
}