import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import type { RouterOutput } from "@/utils/api";

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

  return (
    <ComponentCard title="Client Overview">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Name:</span> {client.clientName}
        </div>
        <div>
          <span className="font-medium">Address:</span> {client.address || "—"}
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
  );
} 