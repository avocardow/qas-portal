"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import PaginationWithText from "@/components/ui/pagination/PaginationWithText";
import { useTasks } from "@/hooks/use-tasks";
import TaskDetailModal from "@/components/task/TaskDetailModal";
import { usePermission } from "@/context/RbacContext";
import { TASK_PERMISSIONS } from "@/constants/permissions";

export default function TasksPage() {
  // RBAC: check view and create permissions
  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);
  const canCreateTask = usePermission(TASK_PERMISSIONS.CREATE);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const {
    data: tasks,
    isLoading,
    isError,
  } = useTasks({
    page,
    sortBy,
    sortOrder,
    status,
  });

  // RBAC: return early if no view permission
  if (!canViewTasks) {
    return <p>You are not authorized to view tasks.</p>;
  }

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError || !tasks) return <p>Error loading tasks.</p>;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Tasks</h2>
        {canCreateTask && (
          <Button onClick={() => router.push("/tasks/new")}>
            Add New Task
          </Button>
        )}
      </div>
      <div className="mb-4 flex items-center gap-4">
        <label>
          Status:
          <input
            type="text"
            value={status || ""}
            onChange={(e) => {
              setStatus(e.target.value || undefined);
              setPage(1);
            }}
            className="ml-2 rounded border px-2 py-1"
          />
        </label>
      </div>
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableCell isHeader onClick={() => handleSort("name")}>
              Name{" "}
              {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : null}
            </TableCell>
            <TableCell isHeader onClick={() => handleSort("status")}>
              Status{" "}
              {sortBy === "status" ? (sortOrder === "asc" ? "▲" : "▼") : null}
            </TableCell>
            <TableCell isHeader onClick={() => handleSort("priority")}>
              Priority{" "}
              {sortBy === "priority" ? (sortOrder === "asc" ? "▲" : "▼") : null}
            </TableCell>
            <TableCell isHeader onClick={() => handleSort("dueDate")}>
              Due Date{" "}
              {sortBy === "dueDate" ? (sortOrder === "asc" ? "▲" : "▼") : null}
            </TableCell>
            <TableCell isHeader>Assigned To</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {tasks.length ? (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSelectedTaskId(task.id)}
              >
                <TableCell>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tasks/${task.id}`);
                    }}
                  >
                    {task.name}
                  </button>
                </TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.priority || "-"}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{task.assignedUserId || "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>No tasks found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={true}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
      <PaginationWithText
        totalPages={tasks.length < 10 ? page : page + 1}
        initialPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
