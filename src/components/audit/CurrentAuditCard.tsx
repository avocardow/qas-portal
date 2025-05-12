"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useCurrentAudit } from "@/hooks/useCurrentAudit";
import EditAuditModal from "./EditAuditModal";
import { useClientData } from "@/hooks/useClientData";
import type { RouterOutput } from "@/utils/api";
import { useAbility } from '@/hooks/useAbility';
import { AUDIT_PERMISSIONS, CLIENT_PERMISSIONS } from "@/constants/permissions";
import Badge from "@/components/ui/badge/Badge";

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
    invoicePaid,
    invoiceIssueDate,
    assignments,
  } = audit;

  // Compute assigned staff names from auditAssignments
  const assignedNames = assignments?.map(a => a.user?.name).filter(Boolean).join(', ');

  // Determine badge color and text based on invoice state
  let badgeColor: 'success' | 'warning' | 'error';
  let badgeText: string;
  if (invoicePaid) {
    badgeColor = 'success';
    badgeText = 'invoice paid';
  } else if (!invoiceIssueDate) {
    badgeColor = 'warning';
    badgeText = 'invoice not issued';
  } else {
    badgeColor = 'error';
    badgeText = 'invoice unpaid';
  }

  // Helper to format dates as 'Weekday, DD Month, YYYY'
  const formatAUDate = (date: Date) =>
    `${date.toLocaleDateString('en-AU', { weekday: 'long' })}, ${date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;

  return (
    <>
      <ComponentCard
        title="Current Audit"
        actions={
          <div className="flex items-center space-x-2">
            <Badge variant="light" color={badgeColor}>
              {badgeText}
            </Badge>
            {canEditAudit && (
              <EditAuditModal clientId={clientId} existingAudit={audit ?? null} />
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <div>
            <span className="font-medium">Next Contact Date:</span>{" "}
            {clientData?.nextContactDate
              ? formatAUDate(clientData.nextContactDate)
              : "-"}
          </div>
          <div>
            <span className="font-medium">Audit Period End Date:</span>{" "}
            {clientData?.auditPeriodEndDate
              ? formatAUDate(new Date(clientData.auditPeriodEndDate))
              : "-"}
          </div>
          <div>
            <span className="font-semibold">Report Due Date:</span>{" "}
            {reportDueDate
              ? formatAUDate(new Date(reportDueDate))
              : "-"}
          </div>
          <div>
            <span className="font-semibold">Audit Stage:</span> {stage?.name ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">Audit Status:</span> {status?.name ?? "N/A"}
          </div>
          <div className="col-span-full">
            <span className="font-semibold">Staff Assigned:</span>{" "}
            {assignedNames || "Unassigned"}
          </div>
        </div>
      </ComponentCard>
    </>
  );
} 