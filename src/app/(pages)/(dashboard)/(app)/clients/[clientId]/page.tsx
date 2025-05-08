"use client";
import React from "react";
import { useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function ClientDetailPage() {
  const params = useParams<{ clientId: string }>() || {};
  const clientId = params.clientId;

  // Validate clientId param
  if (!clientId) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Invalid client ID.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <PageBreadcrumb
        pageTitle={`Client ${clientId}`}
        items={[{ label: "Clients", href: "/clients" }]}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder for Client Overview */}
        <ComponentCard title="Client Overview">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ComponentCard>

        {/* Placeholder for Current Audit */}
        <ComponentCard title="Current Audit">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ComponentCard>

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
        <ComponentCard title="Contacts">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ComponentCard>

        {/* Placeholder for Files */}
        <ComponentCard title="Files">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}