"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useCurrentAudit } from "@/hooks/useCurrentAudit";
import { format } from "date-fns";
import EditAuditModal from "./EditAuditModal";
import { useClientData } from "@/hooks/useClientData";
import type { RouterOutput } from "@/utils/api";
import { useAbility } from '@/hooks/useAbility';
import { AUDIT_PERMISSIONS, CLIENT_PERMISSIONS } from "@/constants/permissions";

interface CurrentAuditCardProps {
  clientId: string;
}

/**
 * Displays the current audit details for a client in a card layout.
 */
export default function CurrentAuditCard({ clientId }: CurrentAuditCardProps) {
  const { can } = useAbility();
  const canEditAudit = can(AUDIT_PERMISSIONS.EDIT) || can(CLIENT_PERMISSIONS.EDIT);
  const { data: audit, isLoading, isError, error } = useCurrentAudit(clientId);
  const { data: _clientData } = useClientData(clientId);

  // Cast to typed client data for billing fields
  type ClientById = RouterOutput["clients"]["getById"];
  const clientData = _clientData as ClientById | undefined;

  if (isLoading) {
    return <ComponentCard title="Current Audit">Loading...</ComponentCard>;
  }

  if (isError) {
    return (
      <ComponentCard title="Current Audit">
        <p>Error loading audit: {error instanceof Error ? error.message : String(error)}</p>
      </ComponentCard>
    );
  }

  if (!audit) {
    return (
      <ComponentCard title="Current Audit">
        <p>No current audit exists.</p>
      </ComponentCard>
    );
  }

  const {
    reportDueDate,
    stage,
    status,
  } = audit;

  return (
    <>
      <ComponentCard
        title="Current Audit"
        actions={
          canEditAudit && (
            <EditAuditModal clientId={clientId} existingAudit={audit ?? null} />
          )
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <div>
            <span className="font-medium">Next Contact Date:</span>{" "}
            {clientData?.nextContactDate
              ? clientData.nextContactDate.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
              : "-"}
          </div>
          <div>
            <span className="font-medium">Audit Period End Date:</span>{" "}
            {clientData?.auditPeriodEndDate
              ? new Date(clientData.auditPeriodEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
              : "-"}
          </div>
          <div>
            <span className="font-semibold">Report Due Date:</span>{" "}
            {reportDueDate ? format(new Date(reportDueDate), "PPP") : "N/A"}
          </div>
          <div>
            <span className="font-semibold">Audit Stage:</span> {stage?.name ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">Audit Status:</span> {status?.name ?? "N/A"}
          </div>
          <div className="col-span-full">
            <span className="font-semibold">Staff Assigned:</span>{" "}
            {clientData?.assignedUser?.name ?? "Unassigned"}
          </div>
        </div>
      </ComponentCard>
    </>
  );
} 