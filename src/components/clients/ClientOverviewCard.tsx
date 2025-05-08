import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import type { RouterOutput } from "@/utils/api";
import { api } from "@/utils/api";
import EditableField from "@/components/common/EditableField";
import Notification from "@/components/ui/notification/Notification";

// Use the return type from the clients.getById tRPC call
export type ClientWithRelations = RouterOutput["clients"]["getById"];

interface ClientOverviewCardProps {
  client: ClientWithRelations;
}

export default function ClientOverviewCard({ client }: ClientOverviewCardProps) {
  const primaryContact = client.contacts?.find((c) => c.isPrimary);
  const folderLink = client.externalFolderId
    ? `https://sharepoint.com/sites/${client.externalFolderId}`
    : null;
  const utils = api.useContext();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const updateClient = api.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ clientId: client.id });
      setSuccessMessage("Client updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error) => {
      const msg = error?.message || "Failed to update client";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 3000);
    },
  });

  return (
    <>
      {successMessage && <Notification variant="success" title={successMessage} />}
      {errorMessage && <Notification variant="error" title={errorMessage} />}
      <ComponentCard title="Client Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <EditableField
              label="Name"
              value={client.clientName}
              onSave={(value) => updateClient.mutate({ clientId: client.id, clientName: value })}
            />
          </div>
          <div>
            <EditableField
              label="Address"
              value={client.address || ""}
              onSave={(value) =>
                updateClient.mutate({
                  clientId: client.id,
                  clientName: client.clientName,
                  address: value,
                })
              }
            />
          </div>
          <div>
            <span className="font-medium">Folder Link:</span>{" "}
            {folderLink ? (
              <Tooltip content="Open SharePoint folder">
                <a
                  href={folderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Folder
                </a>
              </Tooltip>
            ) : (
              "—"
            )}
          </div>
          <div>
            <span className="font-medium">Primary License:</span>{" "}
            {client.licenses?.[0]?.id || "—"}
          </div>
          <div>
            <span className="font-medium">Phone:</span>{" "}
            {primaryContact?.phone || "—"}
          </div>
          <div>
            <span className="font-medium">Email:</span>{" "}
            {primaryContact?.email || "—"}
          </div>
          <div className="sm:col-span-2">
            <span className="font-medium">Client Manager:</span>{" "}
            {client.assignedUser?.name || "—"}
          </div>
        </div>
      </ComponentCard>
    </>
  );
} 