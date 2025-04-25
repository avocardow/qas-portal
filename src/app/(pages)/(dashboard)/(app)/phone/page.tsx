"use client";
import React, { useState } from "react";
import { api } from "@/utils/api";
import useDebounce from "@/hooks/useDebounce";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { usePermission } from "@/context/RbacContext";
import { PHONE_PERMISSIONS } from "@/constants/permissions";

export default function PhonePage() {
  // Hooks and mutations
  const canMakeCall = usePermission(PHONE_PERMISSIONS.MAKE_CALL);
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter, 500);
  const clientsQuery = api.clients.getAll.useQuery(
    { pageSize: 10, filter: debouncedFilter },
    { enabled: true }
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const clientQuery = api.clients.getById.useQuery(
    { clientId: selectedClientId || "" },
    { enabled: Boolean(selectedClientId) }
  );
  const makeCall = api.phone.makePstnCall.useMutation();
  const handleCall = (contactId: string, number: string) => {
    if (!selectedClientId) return;
    makeCall.mutate({ clientId: selectedClientId, contactId, number });
  };

  // Permission check after hooks
  if (!canMakeCall) {
    return (
      <p className="text-red-500">
        You do not have permission to access Phone features.
      </p>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Phone" />
      <h1 className="mb-4 text-2xl font-semibold">Phone</h1>

      {/* Client Search */}
      {!selectedClientId && (
        <div className="mb-6 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search clients..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1"
          />
        </div>
      )}

      {/* Client List */}
      {!selectedClientId && clientsQuery.data?.items && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>ID</TableCell>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientsQuery.data.items.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.clientName}</TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedClientId(client.id)}
                    className="btn bg-blue-500 px-2 py-1 text-white"
                  >
                    View Contacts
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Contacts List and Call Buttons */}
      {selectedClientId && clientQuery.data && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedClientId(null)}
            className="text-blue-500 hover:underline"
          >
            ← Back to Clients
          </button>
          <h2 className="text-xl font-medium">
            Contacts for {clientQuery.data.clientName}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Phone</TableCell>
                <TableCell isHeader>Call</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientQuery.data.contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name || "–"}</TableCell>
                  <TableCell>{c.phone || "–"}</TableCell>
                  <TableCell>
                    {c.phone ? (
                      canMakeCall ? (
                        <button
                          onClick={() => handleCall(c.id, c.phone!)}
                          className="btn bg-green-500 px-2 py-1 text-white"
                        >
                          Call
                        </button>
                      ) : (
                        <span className="text-gray-500">Not Authorized</span>
                      )
                    ) : (
                      <span className="text-gray-500">No Number</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Call status */}
          {makeCall.status === "pending" && <p>Calling...</p>}
          {makeCall.error && (
            <p className="text-red-500">Error: {makeCall.error.message}</p>
          )}
          {makeCall.data && (
            <p className="text-green-600">
              Call initiated. Log ID: {makeCall.data.callLogId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
