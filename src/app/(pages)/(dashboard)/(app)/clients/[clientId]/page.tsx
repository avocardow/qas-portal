"use client";
import React, { useState } from "react";
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

export default function ClientDetailPage() {
  const params = useParams<{ clientId: string }>() || {};
  const clientId = params.clientId;
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch client data using custom hook
  const { data: clientData, isLoading, isError, error } = useClientData(clientId);
  const title = clientData?.clientName ?? ("Client " + clientId);
  
  // Activity log filtering and pagination setup
  const activityLogs = clientData?.activityLogs ?? [];
  const [filterType, setFilterType] = useState('all');
  const tabs = [
    { label: 'All', type: 'all' },
    { label: 'Notes', type: 'note' },
    { label: 'Emails', type: 'email' },
    { label: 'Calls', type: 'call' },
    { label: 'Updates', type: 'statusUpdate' },
    { label: 'Documents', type: 'document' },
    { label: 'Tasks', type: 'task' },
  ];
  const filteredLogs = filterType === 'all'
    ? activityLogs
    : activityLogs.filter((entry) => entry.type === filterType);
  const [logPage, setLogPage] = useState(1);
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
    <Authorized action={CLIENT_PERMISSIONS.VIEW} fallback={
      <DashboardPlaceholderPageTemplate heading="Access Denied">
        <p>You do not have permission to view this page.</p>
      </DashboardPlaceholderPageTemplate>
    }>
    <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Archive client button */}
        <div className="flex justify-end mb-4">
          <ArchiveClientButton onClick={openModal} />
        </div>
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
              <MoreDotIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 cursor-pointer" />
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
      </div>
      <ArchiveClientModal clientId={clientId} isOpen={isOpen} onClose={closeModal} />
    </Authorized>
  );
}