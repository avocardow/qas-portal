"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/utils/api";

interface TaskDetailModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
}: TaskDetailModalProps) {
  const {
    data: task,
    isLoading,
    isError,
  } = api.task.getById.useQuery({ taskId });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="space-y-4 p-4">
        {isLoading && <p>Loading task details...</p>}
        {isError && <p>Error loading task details.</p>}
        {task && (
          <div>
            <h2 className="mb-2 text-xl font-semibold">{task.name}</h2>
            {task.description && <p className="mb-2">{task.description}</p>}
            <p>
              <strong>Status:</strong> {task.status}
            </p>
            <p>
              <strong>Priority:</strong> {task.priority || "-"}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
            </p>
            <p>
              <strong>Assigned To:</strong> {task.assignedUserId || "-"}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
