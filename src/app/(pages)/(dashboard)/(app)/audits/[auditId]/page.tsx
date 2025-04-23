"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { api } from "@/utils/api";
import Button from "@/components/ui/button/Button";
import DocumentReferences from "@/components/common/DocumentReferences";
import { usePermission } from "@/context/RbacContext";
import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
} from "@/constants/permissions";

export default function AuditDetailPage() {
  const { auditId } = useParams() as { auditId: string };
  const router = useRouter();
  const canViewAudit = usePermission(AUDIT_PERMISSIONS.GET_BY_ID);
  const canAssignUser = usePermission(AUDIT_PERMISSIONS.ASSIGN_USER);
  const canUnassignUser = usePermission(AUDIT_PERMISSIONS.UNASSIGN_USER);
  const canCreateTask = usePermission(TASK_PERMISSIONS.CREATE);
  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_BY_AUDIT_ID);
  const canUpdateTask = usePermission(TASK_PERMISSIONS.UPDATE);
  const canViewDocuments = usePermission(DOCUMENT_PERMISSIONS.GET_BY_AUDIT_ID);
  const {
    data: audit,
    isLoading,
    isError,
    refetch,
  } = api.audit.getById.useQuery({ auditId });
  const assignUserMutation = api.audit.assignUser.useMutation({
    onSuccess: () => refetch(),
  });
  const unassignUserMutation = api.audit.unassignUser.useMutation({
    onSuccess: () => refetch(),
  });
  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: () => refetch(),
  });
  const {
    data: docResources,
    isLoading: isDocsLoading,
    isError: isDocsError,
  } = api.document.getByAuditId.useQuery({ auditId });

  if (!canViewAudit) {
    return <p>You are not authorized to view audit details.</p>;
  }

  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading Audit...">
        <p>Loading audit details...</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  if (isError || !audit) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Error loading audit details.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  return (
    <DashboardPlaceholderPageTemplate
      heading={`Audit ${audit.auditYear}`}
      className="max-w-4xl"
    >
      <PageBreadcrumb pageTitle={`Audit ${audit.auditYear}`} />
      <div className="space-y-6">
        <ComponentCard title="Audit Details">
          <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-gray-100">
            <div>
              <strong>Year:</strong> {audit.auditYear}
            </div>
            <div>
              <strong>Stage:</strong> {audit.stage?.name || "-"}
            </div>
            <div>
              <strong>Status:</strong> {audit.status?.name || "-"}
            </div>
            <div>
              <strong>Due Date:</strong>{" "}
              {audit.reportDueDate
                ? new Date(audit.reportDueDate).toLocaleDateString()
                : "-"}
            </div>
            <div>
              <strong>Lodged With OFT Date:</strong>{" "}
              {audit.lodgedWithOFTDate
                ? new Date(audit.lodgedWithOFTDate).toLocaleDateString()
                : "-"}
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Assigned Team">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Team Members</h2>
            {canAssignUser && (
              <Button
                onClick={() => {
                  const userId = prompt("Enter User ID to assign");
                  const role = prompt("Enter role (optional)");
                  if (userId)
                    assignUserMutation.mutate({
                      auditId,
                      userId,
                      role: role || undefined,
                    });
                }}
              >
                Add Team Member
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Role</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.assignments.length ? (
                audit.assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.userId}</TableCell>
                    <TableCell>{assignment.role || "-"}</TableCell>
                    <TableCell>
                      {canUnassignUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                          onClick={() =>
                            unassignUserMutation.mutate({
                              auditId,
                              userId: assignment.userId,
                            })
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No team members assigned.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ComponentCard>

        <ComponentCard title="Tasks">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Tasks</h2>
            {canCreateTask && (
              <Button
                onClick={() => router.push(`/tasks/new?auditId=${auditId}`)}
              >
                Add Task
              </Button>
            )}
          </div>
          {canViewTasks ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Task</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Due Date</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.tasks.length ? (
                  audit.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>
                        {canUpdateTask ? (
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskMutation.mutate({
                                taskId: task.id,
                                status: e.target.value,
                              })
                            }
                            className="rounded border px-2 py-1"
                          >
                            {["To Do", "In Progress", "Done"].map(
                              (statusOption) => (
                                <option key={statusOption} value={statusOption}>
                                  {statusOption}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          <span>{task.status}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/tasks/${task.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      No tasks found for this audit.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <p>You are not authorized to view tasks.</p>
          )}
        </ComponentCard>

        <ComponentCard title="Documents">
          {isDocsLoading && <p>Loading documents...</p>}
          {isDocsError && <p>Error loading documents.</p>}
          {canViewDocuments ? (
            docResources && <DocumentReferences documents={docResources} />
          ) : (
            <p>You are not authorized to view documents.</p>
          )}
        </ComponentCard>

        <ComponentCard title="Activity Log">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Time</TableCell>
                <TableCell isHeader>User</TableCell>
                <TableCell isHeader>Type</TableCell>
                <TableCell isHeader>Content</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.activityLogs.length ? (
                audit.activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.user.name || log.user.id}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.content}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    No activity logs found for this audit.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ComponentCard>
      </div>
    </DashboardPlaceholderPageTemplate>
  );
}
