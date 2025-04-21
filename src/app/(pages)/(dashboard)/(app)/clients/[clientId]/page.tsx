"use client";
import React from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";

export default function ClientPage() {
  const { clientId } = useParams() as { clientId: string };
  const clientQuery = api.client.getById.useQuery({ clientId });
  const client = clientQuery.data;
  const isLoading = clientQuery.isLoading;
  const error = clientQuery.error;

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

  if (!client) {
    return (
      <DashboardPlaceholderPageTemplate
        heading="Client Details"
        message="Client not found."
      />
    );
  }

  const {
    id,
    clientName,
    abn,
    address,
    city,
    postcode,
    status,
    auditMonthEnd,
    nextContactDate,
    estAnnFees,
  } = client;

  return (
    <DashboardPlaceholderPageTemplate heading={clientName}>
      <div className="mt-6 space-y-4 text-left">
        <div>
          <strong>ID:</strong> {id}
        </div>
        <div>
          <strong>ABN:</strong> {abn ?? "-"}
        </div>
        <div>
          <strong>Address:</strong> {address ?? "-"}
        </div>
        <div>
          <strong>City:</strong> {city ?? "-"}
        </div>
        <div>
          <strong>Postcode:</strong> {postcode ?? "-"}
        </div>
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Audit Month End:</strong> {auditMonthEnd ?? "-"}
        </div>
        <div>
          <strong>Next Contact Date:</strong>{" "}
          {nextContactDate
            ? new Date(nextContactDate).toLocaleDateString()
            : "-"}
        </div>
        <div>
          <strong>Estimated Annual Fees:</strong>{" "}
          {estAnnFees?.toString() ?? "-"}
        </div>
      </div>
    </DashboardPlaceholderPageTemplate>
  );
}
