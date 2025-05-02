"use client";
import React, { Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { api } from "@/utils/api";
import { useAbility } from "@/hooks/useAbility";
import { CLIENT_PERMISSIONS } from "@/constants/permissions";
import type { RouterOutput } from "@/utils/api";
import type { ClientDetailsSectionProps } from '@/components/clients/ClientDetailsSection';

// Lazy load client sections for progressive loading
const ClientOverviewCard = lazy(() => import("@/components/clients/ClientOverviewCard"));
const ClientContactsSection = lazy(() => import("@/components/clients/ClientContactsSection"));
const ClientAssignedUserSection = lazy(() => import("@/components/clients/ClientAssignedUserSection"));
const ClientLicensesSection = lazy(() => import("@/components/clients/ClientLicensesSection"));
const ClientTrustAccountsSection = lazy(() => import("@/components/clients/ClientTrustAccountsSection"));
const AuditList = lazy(() => import("@/components/audit/AuditList"));
const DocumentReferences = lazy(() => import("@/components/common/DocumentReferences"));

// Lazy load ClientDetailsSection with correct prop types
const ClientDetailsSection = lazy<React.ComponentType<ClientDetailsSectionProps>>(
  () => import("@/components/clients/ClientDetailsSection")
);

// Define client type including relations returned by getById tRPC output
type ClientWithRelations = RouterOutput['clients']['getById'];

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { can } = useAbility();
  const { data: clientData, isLoading, isError } = api.clients.getById.useQuery({ clientId });
  const client = clientData as ClientWithRelations;

  // Permission gating
  if (!can(CLIENT_PERMISSIONS.VIEW_STATUS)) {
    return <p>You are not authorized to view client details.</p>;
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <p>Loading client...</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  // Error state
  if (isError || !client) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Error loading client details.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  // Render client data
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <PageBreadcrumb pageTitle={client.clientName} />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<ComponentCard title="Client Overview"><p>Loading overview...</p></ComponentCard>}>
            <ClientOverviewCard client={client} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Contacts"><p>Loading contacts...</p></ComponentCard>}>
            <ClientContactsSection contacts={client.contacts} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Licenses"><p>Loading licenses...</p></ComponentCard>}>
            <ClientLicensesSection licenses={client.licenses} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Trust Accounts"><p>Loading trust accounts...</p></ComponentCard>}>
            <ClientTrustAccountsSection trustAccounts={client.trustAccounts} />
          </Suspense>
        </div>
        <div className="col-span-12 xl:col-span-8">
          {client.assignedUser && (
            <Suspense fallback={<ComponentCard title="Assigned User"><p>Loading assigned user...</p></ComponentCard>}>
              <ClientAssignedUserSection assignedUser={client.assignedUser} />
            </Suspense>
          )}
          <Suspense fallback={<ComponentCard title="Client Details"><p>Loading details...</p></ComponentCard>}>
            <ClientDetailsSection client={client} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Audits"><p>Loading audits...</p></ComponentCard>}>
            <AuditList clientId={client.id} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Activity Log"><p>Loading activity log...</p></ComponentCard>}>
            <ComponentCard title="Activity Log">
              <ul>
                {(client.activityLogs ?? []).map((log) => (
                  <li key={log.id}>
                    {new Date(log.createdAt).toLocaleString()}: {log.content}
                  </li>
                ))}
              </ul>
            </ComponentCard>
          </Suspense>
          <Suspense fallback={<ComponentCard title="Documents"><p>Loading documents...</p></ComponentCard>}>
            <DocumentReferences documents={client.documents ?? []} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}