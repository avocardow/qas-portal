import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import { useClientData } from "@/hooks/useClientData";
import SpinnerOne from "@/components/ui/spinners/SpinnerOne";
import ErrorFallback from "@/components/common/ErrorFallback";
import type { RouterOutput } from "@/utils/api";

interface ClientProfileProps {
  clientId: string;
}

export default function ClientProfile({ clientId }: ClientProfileProps) {
  const { data: _clientData, isLoading, isError, error } = useClientData(clientId);
  // Cast raw data to typed ClientById for proper property inference
  type ClientById = RouterOutput["clients"]["getById"];
  const client = _clientData as ClientById | undefined;

  if (isLoading) {
    return <SpinnerOne />;
  }

  if (isError) {
    return <ErrorFallback message={error?.message} />;
  }

  if (!client) {
    return (
      <DashboardPlaceholderPageTemplate heading="Client Not Found">
        <p>The requested client could not be found or may have been deleted.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{client.clientName}</h2>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <span className="font-medium">Status:</span>{" "}
          <span className="text-sm uppercase">{client.status}</span>
        </div>
      </div>
    </div>
  );
} 