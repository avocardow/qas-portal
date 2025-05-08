"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useCurrentAudit } from "@/hooks/useCurrentAudit";
import { format } from "date-fns";
import Authorized from "@/components/Authorized";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";

interface CurrentAuditCardProps {
  clientId: string;
}

/**
 * Displays the current audit details for a client in a card layout.
 */
export default function CurrentAuditCard({ clientId }: CurrentAuditCardProps) {
  const { data: audit, isLoading, isError, error } = useCurrentAudit(clientId);

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
    auditYear,
    reportDueDate,
    stage,
    status,
    assignments,
  } = audit;

  return (
    <ComponentCard
      title="Current Audit"
      actions={
        <Authorized action={AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS}>
          <button className="btn btn-sm">Edit</button>
        </Authorized>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="font-semibold">Audit Year:</span> {auditYear}
        </div>
        <div>
          <span className="font-semibold">Report Due Date:</span>{" "}
          {reportDueDate ? format(new Date(reportDueDate), "PPP") : "N/A"}
        </div>
        <div>
          <span className="font-semibold">Audit Stage:</span>{" "}
          {stage.name}
        </div>
        <div>
          <span className="font-semibold">Audit Status:</span>{" "}
          {status.name}
        </div>
        <div className="col-span-full">
          <span className="font-semibold">Staff Assigned:</span>{" "}
          {assignments.map((a) => a.user.name).join(", ")}
        </div>
      </div>
    </ComponentCard>
  );
} 