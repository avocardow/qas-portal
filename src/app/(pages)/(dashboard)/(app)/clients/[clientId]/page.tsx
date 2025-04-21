"use client";
import React from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function ClientPage() {
  const { clientId } = useParams() as { clientId: string };
  const clientQuery = api.client.getById.useQuery({ clientId });
  const client = clientQuery.data;
  const isLoading = clientQuery.isLoading;
  const error = clientQuery.error;

  return (
    <div>
      <PageBreadcrumb pageTitle="Client Details" />
      <div className="space-y-6">
        <ComponentCard title={client?.clientName || "Client Details"}>
          {isLoading && <p>Loading...</p>}
          {error && <p>Error loading client.</p>}
          {!client && !isLoading && !error && <p>Client not found.</p>}
          {client && (
            <div className="space-y-4">
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
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
