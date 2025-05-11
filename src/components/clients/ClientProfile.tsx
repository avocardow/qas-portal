import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import { useClientData } from "@/hooks/useClientData";
import SpinnerOne from "@/components/ui/spinners/SpinnerOne";
import ErrorFallback from "@/components/common/ErrorFallback";
import Badge from "@/components/ui/badge/Badge";
import type { RouterOutput } from "@/utils/api";

interface ClientProfileProps {
  clientId: string;
  showStatus?: boolean;
}

export default function ClientProfile({ clientId, showStatus = true }: ClientProfileProps) {
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

  // Determine badge color based on status
  const status = String(client.status).toLowerCase();
  let color: "success" | "warning" | "error" | "info" | "primary" | "dark" | "light" = "info";
  switch (status) {
    case "active":
      color = "success";
      break;
    case "archived":
      color = "light";
      break;
    case "prospect":
      color = "primary";
      break;
    default:
      color = "info";
  }
  return (
    <div className="space-y-4">
      {showStatus && (
        <Badge size="sm" variant="light" color={color}>
          {client.status}
        </Badge>
      )}
      <h2 className="text-2xl font-semibold">{client.clientName}</h2>
    </div>
  );
} 