"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { api } from "@/utils/api";
import Notification from "@/components/ui/notification/Notification";
import { CLIENT_PERMISSIONS } from "@/constants/permissions";
import { useAbility } from "@/hooks/useAbility";

interface ArchiveClientModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchiveClientModal({ clientId, isOpen, onClose }: ArchiveClientModalProps) {
  const { can } = useAbility();
  const utils = api.useContext();
  const archiveMutation = api.clients.archive.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ clientId });
      onClose();
    },
    onError: (error: unknown) => {
      // Show error notification
      Notification({ variant: "error", title: error instanceof Error ? error.message : "Failed to archive client" });
    }
  });

  if (!can(CLIENT_PERMISSIONS.ARCHIVE)) return null;

  const handleArchive = () => {
    archiveMutation.mutate({ clientId });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Archive Client</h3>
      <p className="mt-2 text-sm text-gray-500">Are you sure you want to archive this client? This action cannot be undone.</p>
      <div className="mt-4 flex justify-end space-x-3">
        <Button variant="link" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleArchive} disabled={archiveMutation.status === "pending"}>
          {archiveMutation.status === "pending" ? "Archiving..." : "Archive"}
        </Button>
      </div>
    </Modal>
  );
} 