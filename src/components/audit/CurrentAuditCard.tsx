"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useCurrentAudit } from "@/hooks/useCurrentAudit";
import { format } from "date-fns";
import Authorized from "@/components/Authorized";
import { AUDIT_PERMISSIONS, CLIENT_PERMISSIONS } from "@/constants/permissions";
import { useModal } from "@/hooks/useModal";
import EditAuditModal from "./EditAuditModal";
import { useClientData } from "@/hooks/useClientData";
import type { RouterOutput } from "@/utils/api";

interface CurrentAuditCardProps {
  clientId: string;
}

/**
 * Displays the current audit details for a client in a card layout.
 */
export default function CurrentAuditCard({ clientId }: CurrentAuditCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { data: audit, isLoading, isError, error } = useCurrentAudit(clientId);
  const { data: _clientData, isLoading: feesLoading, isError: feesError, error: feesErrorObj } = useClientData(clientId);

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
    auditYear,
    reportDueDate,
    stage,
    status,
  } = audit;

  return (
    <>
      <ComponentCard
        title="Current Audit"
        actions={
          <Authorized action={AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS}>
            <button className="btn btn-sm" onClick={openModal}>Edit</button>
          </Authorized>
        }
      >
        <Authorized action={CLIENT_PERMISSIONS.VIEW_BILLING}>
          {feesLoading ? (
            <div>Loading current fees...</div>
          ) : feesError ? (
            <div>Error loading current fees: {feesErrorObj instanceof Error ? feesErrorObj.message : String(feesErrorObj)}</div>
          ) : (
            <div className="mb-4">
              <span className="font-semibold">Current Fees:</span>{" "}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(clientData as any)?.estAnnFees?.toLocaleString(undefined, { style: "currency", currency: "USD" })}
            </div>
          )}
        </Authorized>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="font-semibold">Audit Year:</span> {auditYear}
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
      <EditAuditModal
        clientId={clientId}
        existingAudit={audit ?? null}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
} 