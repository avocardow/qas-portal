"use client";
import React from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClientOverviewCard from "@/components/clients/ClientOverviewCard";
import ClientDetailsSection from "@/components/clients/ClientDetailsSection";
import { api } from "@/utils/api";
import { useAbility } from "@/hooks/useAbility";
import { CLIENT_PERMISSIONS } from "@/constants/permissions";

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
          <ClientOverviewCard client={client} />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <ClientDetailsSection client={client} />
        </div>
      </div>
    </div>
  );
}