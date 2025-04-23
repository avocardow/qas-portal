import React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { usePermission } from "@/context/RbacContext";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";

interface AuditListProps {
  clientId: string;
}

const AuditList: React.FC<AuditListProps> = ({ clientId }) => {
  const router = useRouter();
  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
  const canCreateAudit = usePermission(AUDIT_PERMISSIONS.CREATE);
  const canUpdateStageStatus = usePermission(
    AUDIT_PERMISSIONS.UPDATE_STAGE_STATUS
  );
  const {
    data: audits,
    isLoading: isLoadingAudits,
    isError,
    refetch: refetchAudits,
  } = api.audit.getByClientId.useQuery({ clientId });

  const { data: stages, isLoading: isLoadingStages } =
    api.audit.getStages.useQuery();
  const { data: statuses, isLoading: isLoadingStatuses } =
    api.audit.getStatuses.useQuery();

  const updateStageStatusMutation = api.audit.updateStageStatus.useMutation({
    onSuccess: () => {
      refetchAudits();
    },
  });

  if (!canViewAudits) {
    return <p>You are not authorized to view audits.</p>;
  }

  if (isLoadingAudits || isLoadingStages || isLoadingStatuses)
    return <p>Loading audits...</p>;
  if (isError || !audits) return <p>Error loading audits.</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Audits</h2>
        {canCreateAudit && (
          <Button
            onClick={() => router.push(`/audits/new?clientId=${clientId}`)}
          >
            Add New Audit Year
          </Button>
        )}
      </div>
      <Table>
        <TableHeader className="bg-surface-accent dark:bg-surface-accent">
          <TableRow>
            <TableCell isHeader>Year</TableCell>
            <TableCell isHeader>Stage</TableCell>
            <TableCell isHeader>Status</TableCell>
            <TableCell isHeader>Due Date</TableCell>
            <TableCell isHeader>Assigned Staff</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-border bg-surface dark:divide-border dark:bg-surface divide-y">
          {audits.length ? (
            audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => router.push(`/audits/${audit.id}`)}
                  >
                    {audit.auditYear}
                  </button>
                </TableCell>
                <TableCell>
                  {canUpdateStageStatus ? (
                    <select
                      value={audit.stage?.id ?? ""}
                      className="rounded border px-2 py-1"
                      onChange={(e) =>
                        updateStageStatusMutation.mutate({
                          auditId: audit.id,
                          stageId: parseInt(e.target.value),
                          statusId: audit.status?.id ?? statuses?.[0]?.id ?? 0,
                        })
                      }
                    >
                      <option value="">--</option>
                      {stages?.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge size="sm">{audit.stage?.name || "-"}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {canUpdateStageStatus ? (
                    <select
                      value={audit.status?.id ?? ""}
                      className="rounded border px-2 py-1"
                      onChange={(e) =>
                        updateStageStatusMutation.mutate({
                          auditId: audit.id,
                          stageId: audit.stage?.id ?? stages?.[0]?.id ?? 0,
                          statusId: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value="">--</option>
                      {statuses?.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge size="sm">{audit.status?.name || "-"}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {audit.reportDueDate
                    ? new Date(audit.reportDueDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>No audits found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditList;
