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
  
  // Pagination setup for activity logs
  const activityLogs = clientData?.activityLogs ?? [];
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 5;
  const totalLogPages = Math.ceil(activityLogs.length / logsPerPage);
  const pagedLogs = activityLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);

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
            {/* Paginated Activity Log */}
            <ActivityLogTimeline entries={pagedLogs} />
            {totalLogPages > 1 && (
              <PaginationWithIcon
                totalPages={totalLogPages}
                initialPage={1}
                onPageChange={setLogPage}
              />
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