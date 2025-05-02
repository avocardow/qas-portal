"use client";
import React, { Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { api } from "@/utils/api";
import { useAbility } from "@/hooks/useAbility";
import { CLIENT_PERMISSIONS } from "@/constants/permissions";

// Lazy load client sections for progressive loading
const ClientOverviewCard = lazy(() => import("@/components/clients/ClientOverviewCard"));
const ClientDetailsSection = lazy(() => import("@/components/clients/ClientDetailsSection"));
const ClientContactsSection = lazy(() => import("@/components/clients/ClientContactsSection"));
const ClientAssignedUserSection = lazy(() => import("@/components/clients/ClientAssignedUserSection"));

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { can } = useAbility();
  const { data: client, isLoading, isError } = api.clients.getById.useQuery({ clientId });

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
        </div>
      </div>
    </div>
  );
}