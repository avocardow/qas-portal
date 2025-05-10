"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/utils/api";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";
import type { CurrentAudit } from "@/hooks/useCurrentAudit";
import { useAbility } from "@/hooks/useAbility";

interface EditAuditModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  existingAudit: CurrentAudit | null;
}

export default function EditAuditModal({ clientId, isOpen, onClose, existingAudit }: EditAuditModalProps) {
  const ability = useAbility();
  const utils = api.useContext();
  const { data: managers = [] } = api.user.getAssignableManagers.useQuery();
  const stagesQuery = api.audit.getStages.useQuery();
  const statusesQuery = api.audit.getStatuses.useQuery();
  const createMutation = api.audit.create.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      onClose();
    },
  });
  const updateMutation = api.audit.updateStageStatus.useMutation({
    onSuccess: () => {
      utils.audit.getCurrent.invalidate();
      onClose();
    },
  });
  const assignMutation = api.audit.assignUser.useMutation();
  const unassignMutation = api.audit.unassignUser.useMutation();

  const [auditYear, setAuditYear] = useState(existingAudit?.auditYear ?? new Date().getFullYear());
  const [stageId, setStageId] = useState<number | undefined>(existingAudit?.stage?.id);
  const [statusId, setStatusId] = useState<number | undefined>(existingAudit?.status?.id);
  const initAssign = existingAudit?.assignments?.[0]?.userId ?? null;
  const [assignedUserId, setAssignedUserId] = useState<string | null>(initAssign);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      let auditId: string;
      if (existingAudit) {
        await updateMutation.mutateAsync({ auditId: existingAudit.id, stageId: stageId!, statusId: statusId! });
        auditId = existingAudit.id;
      } else {
        const created = await createMutation.mutateAsync({ clientId, auditYear, stageId, statusId });
        auditId = created.id;
      }
      if (assignedUserId !== initAssign) {
        if (initAssign) {
          await unassignMutation.mutateAsync({ auditId, userId: initAssign });
        }
        if (assignedUserId) {
          await assignMutation.mutateAsync({ auditId, userId: assignedUserId });
        }
      }
      utils.audit.getCurrent.invalidate();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  if (!ability.can(AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS)) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {existingAudit ? "Edit Audit" : "Create Audit"}
        </h2>
        {!existingAudit && (
          <div className="mb-4">
            <label className="block text-sm font-medium">Audit Year</label>
            <input
              type="number"
              value={auditYear}
              onChange={(e) => setAuditYear(parseInt(e.target.value) || auditYear)}
              className="mt-1 block w-full"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium">Stage</label>
          <select
            value={stageId}
            onChange={(e) => setStageId(parseInt(e.target.value))}
            className="mt-1 block w-full"
          >
            {stagesQuery.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Status</label>
          <select
            value={statusId}
            onChange={(e) => setStatusId(parseInt(e.target.value))}
            className="mt-1 block w-full"
          >
            {statusesQuery.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Staff</label>
          <select
            value={assignedUserId ?? ""}
            onChange={(e) => setAssignedUserId(e.target.value || null)}
            className="mt-1 block w-full"
          >
            <option value="">Unassigned</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </div>
        {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.status === "pending" || updateMutation.status === "pending"}
            className="btn btn-primary"
          >
            {existingAudit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
} 