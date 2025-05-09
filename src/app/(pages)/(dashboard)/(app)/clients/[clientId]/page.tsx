"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ClientContactsSection from '@/components/clients/ClientContactsSection';
import ClientTrustAccountsSection from '@/components/clients/ClientTrustAccountsSection';
import { useClientData } from "@/hooks/useClientData";
import SpinnerOne from "@/components/ui/spinners/SpinnerOne";
import ErrorFallback from "@/components/common/ErrorFallback";
import ClientProfile from "@/components/clients/ClientProfile";
import Authorized from '@/components/Authorized';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import CurrentAuditCard from '@/components/audit/CurrentAuditCard';
import ArchiveClientButton from '@/components/clients/ArchiveClientButton';
import ArchiveClientModal from '@/components/clients/ArchiveClientModal';
import { useModal } from '@/hooks/useModal';
import ActivityLogTimeline from '@/components/clients/ActivityLogTimeline';
import { MoreDotIcon } from '@/icons';
import PaginationWithIcon from '@/components/ui/pagination/PaginationWitIcon';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';

export default function ClientDetailPage() {
  const params = (useParams() as { clientId: string }) || {};
  const clientId = params.clientId;
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch client data using custom hook
  const { data: clientData, isLoading, isError, error } = useClientData(clientId);
  const activityLogs = clientData?.activityLogs ?? [];

  // State for filters and pagination
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [logPage, setLogPage] = useState(1);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  function toggleActionsDropdown() {
    setIsActionsDropdownOpen(prev => !prev);
  }

  function closeActionsDropdown() {
    setIsActionsDropdownOpen(false);
  }

  function handleAdjustFilter() {
    closeActionsDropdown();
    // TODO: implement adjust filter logic
  }

  function handleNewActivityItem() {
    closeActionsDropdown();
    // TODO: implement new activity item creation
  }

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
    { label: 'Updates', type: 'statusUpdate' },
    { label: 'Documents', type: 'document' },
    { label: 'Tasks', type: 'task' },
  ];
  const filteredLogs = (() => {
    let logs = activityLogs;
    if (filterType !== 'all') logs = logs.filter((entry) => entry.type === filterType);
    if (startDate) logs = logs.filter((entry) => new Date(entry.createdAt) >= new Date(startDate));
    if (endDate) logs = logs.filter((entry) => new Date(entry.createdAt) <= new Date(endDate));
    return logs;
  })();
  const logsPerPage = 5;
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);
  const pagedLogs = filteredLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);
  
  // Handle loading state
  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <SpinnerOne />
      </DashboardPlaceholderPageTemplate>
    );
  }
  
  // Handle error state
  if (isError) {
    return <ErrorFallback message={error?.message} />;
  }

  // Validate clientId param
  if (!clientId) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Invalid client ID.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  return (
    <Authorized
      action={CLIENT_PERMISSIONS.VIEW}
      fallback={
        <DashboardPlaceholderPageTemplate heading="Access Denied">
          <p>You do not have permission to view this page.</p>
        </DashboardPlaceholderPageTemplate>
      }
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageBreadcrumb
          pageTitle={title}
          items={[{ label: "Clients", href: "/clients" }]}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Overview */}
          <ComponentCard title="Client Overview">
            <ClientProfile clientId={clientId} />
          </ComponentCard>

          {/* Placeholder for Current Audit */}
            <CurrentAuditCard clientId={clientId} />

          {/* Placeholder for Client History */}
          <ComponentCard title="Client History">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </ComponentCard>

            {/* Activity Log Section styled as Activities card */}
            <ComponentCard
              title="Activities"
              actions={
                <div className="flex items-center">
                  <div className="relative">
                    <button onClick={toggleActionsDropdown} className="dropdown-toggle">
                      <MoreDotIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </button>
                    <Dropdown isOpen={isActionsDropdownOpen} onClose={closeActionsDropdown} className="w-40 p-2">
                      <DropdownItem onItemClick={handleAdjustFilter}>
                        Adjust Filter
                      </DropdownItem>
                      <DropdownItem onItemClick={handleNewActivityItem}>
                        New Activity Item
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </div>
              }
            >
              {/* Filter Tabs */}
              <div className="mb-4 overflow-x-auto">
                <nav className="inline-flex whitespace-nowrap rounded-lg bg-gray-100 p-1 dark:bg-gray-900 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
                  {tabs.map((tab) => (
                     <button
                       key={tab.type}
                       onClick={() => { setFilterType(tab.type); setLogPage(1); }}
                       className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
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
              <ActivityLogTimeline entries={pagedLogs} />
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

          {/* Placeholder for Contacts */}
            <div className="lg:col-span-2">
          <ClientContactsSection contacts={clientData!.contacts} />
            </div>

            {/* Trust Accounts Section */}
            <div className="lg:col-span-2">
              <ClientTrustAccountsSection trustAccounts={clientData!.trustAccounts} />
            </div>
          </div>
          {/* Archive client button at bottom center */}
          <div className="mt-8 flex justify-center">
            <ArchiveClientButton onClick={openModal} />
          </div>
        </div>
      </div>
      {<ArchiveClientModal clientId={clientId} isOpen={isOpen} onClose={closeModal} />}
    </Authorized>
  );
}