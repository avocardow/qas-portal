"use client";
import React from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";

export default function ClientPage() {
  const { clientId } = useParams();
  const {
    data: client,
    isLoading,
    error,
  } = api.client.getById.useQuery({ clientId });

  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate
        heading="Client Details"
        message="Loading..."
      />
    );
  }

  if (error) {
    return (
      <DashboardPlaceholderPageTemplate
        heading="Client Details"
        message="Error loading client."
      />
    );
  }

  return (
    <DashboardPlaceholderPageTemplate heading={client.clientName}>
      <div className="mt-6 space-y-4 text-left">
        <div>
          <strong>ID:</strong> {client.id}
        </div>
        <div>
          <strong>ABN:</strong> {client.abn ?? "-"}
        </div>
        <div>
          <strong>Address:</strong> {client.address ?? "-"}
        </div>
        <div>
          <strong>City:</strong> {client.city ?? "-"}
        </div>
        <div>
          <strong>Postcode:</strong> {client.postcode ?? "-"}
        </div>
        <div>
          <strong>Status:</strong> {client.status}
        </div>
        <div>
          <strong>Audit Month End:</strong> {client.auditMonthEnd ?? "-"}
        </div>
        <div>
          <strong>Next Contact Date:</strong>{" "}
          {client.nextContactDate
            ? new Date(client.nextContactDate).toLocaleDateString()
            : "-"}
        </div>
        <div>
          <strong>Estimated Annual Fees:</strong>{" "}
          {client.estAnnFees?.toString() ?? "-"}
        </div>
      </div>
    </DashboardPlaceholderPageTemplate>
  );
}
