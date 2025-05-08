"use client";
import React from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ClientContactsSection from '@/components/clients/ClientContactsSection';
import { useClientData } from "@/hooks/useClientData";
import SpinnerOne from "@/components/ui/spinners/SpinnerOne";
import ErrorFallback from "@/components/common/ErrorFallback";
import ClientProfile from "@/components/clients/ClientProfile";
import Authorized from '@/components/Authorized';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import CurrentAuditCard from '@/components/audit/CurrentAuditCard';
import CurrentFeesCard from '@/components/clients/CurrentFeesCard';
import ArchiveClientButton from '@/components/clients/ArchiveClientButton';
import ArchiveClientModal from '@/components/clients/ArchiveClientModal';
import { useModal } from '@/hooks/useModal';

export default function ClientDetailPage() {
  const params = useParams<{ clientId: string }>() || {};
  const clientId = params.clientId;
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch client data using custom hook
  const { data: clientData, isLoading, isError, error } = useClientData(clientId);
  const title = clientData?.clientName ?? ("Client " + clientId);
  
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
          <CurrentFeesCard clientId={clientId} />

          {/* Placeholder for Client History */}
          <ComponentCard title="Client History">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </ComponentCard>

          {/* Placeholder for Activity Log */}
          <ComponentCard title="Activity Log">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </ComponentCard>

          {/* Placeholder for Contacts */}
          <div className="lg:col-span-2">
            <ClientContactsSection contacts={clientData!.contacts} />
          </div>

          {/* Placeholder for Files */}
          <ComponentCard title="Files">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </ComponentCard>
        </div>
      </div>
      <ArchiveClientModal clientId={clientId} isOpen={isOpen} onClose={closeModal} />
    </Authorized>
  );
}