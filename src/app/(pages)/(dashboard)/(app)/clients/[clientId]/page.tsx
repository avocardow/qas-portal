/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import AuditList from "@/components/audit/AuditList";

type TabKey =
  | "Summary"
  | "Contacts"
  | "Licenses"
  | "Trust Accounts"
  | "Audits"
  | "Activity Log";

export default function ClientDetailPage() {
  const { clientId } = useParams() as { clientId: string };
  const router = useRouter();
  const deleteClientMutation = api.client.deleteClient.useMutation();
  const {
    data: client,
    isLoading,
    isError,
  } = api.client.getById.useQuery({ clientId });

  const detailClient = client as any;
  const [activeTab, setActiveTab] = useState<TabKey>("Summary");

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(
        { clientId },
        {
          onSuccess: () => {
            router.push("/clients");
          },
          onError: (error) => {
            console.error(error);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <p>Loading client...</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  if (isError || !client) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Error loading client.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  const tabs: TabKey[] = [
    "Summary",
    "Contacts",
    "Licenses",
    "Trust Accounts",
    "Audits",
    "Activity Log",
  ];

  return (
    <DashboardPlaceholderPageTemplate
      heading={client.clientName}
      className="max-w-4xl"
    >
      <PageBreadcrumb pageTitle={client.clientName} />
      <div className="mb-4 flex justify-end space-x-2">
        <Link href={`/clients/${clientId}/edit`}>
          <button className="btn bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800">
            Edit Client
          </button>
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleteClientMutation.status === "pending"}
          className="btn bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
        >
          {deleteClientMutation.status === "pending"
            ? "Deleting..."
            : "Delete Client"}
        </button>
      </div>
      <ComponentCard title="Client Details">
        {/* Tabs Navigation */}
        <nav className="flex space-x-4 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="mt-4">
          {activeTab === "Summary" && (
            <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-gray-100">
              <div>
                <strong>Name:</strong> {client.clientName}
              </div>
              <div>
                <strong>ABN:</strong> {client.abn || "-"}
              </div>
              <div>
                <strong>Address:</strong> {client.address || "-"}
              </div>
              <div>
                <strong>City:</strong> {client.city || "-"}
              </div>
              <div>
                <strong>Postcode:</strong> {client.postcode || "-"}
              </div>
              <div>
                <strong>Status:</strong> {client.status}
              </div>
              <div>
                <strong>Audit Month End:</strong> {client.auditMonthEnd ?? "-"}
              </div>
              <div>
                <strong>Next Contact Date:</strong>{" "}
                {client.nextContactDate
                  ? new Date(client.nextContactDate).toLocaleDateString()
                  : "-"}
              </div>
              <div>
                <strong>Estimated Annual Fees:</strong>{" "}
                {client.estAnnFees ? client.estAnnFees.toString() : "-"}
              </div>
            </div>
          )}
          {activeTab === "Contacts" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Primary
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.contacts.length ? (
                  detailClient.contacts.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {c.name || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {c.email || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {c.phone || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {c.title || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {c.isPrimary ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      No contacts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Licenses" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    License Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Renewal Month
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Primary
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.licenses.length ? (
                  detailClient.licenses.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {l.licenseNumber}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {l.licenseType || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {l.renewalMonth ?? "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {l.isPrimary ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      No licenses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Trust Accounts" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Account Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Bank Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    BSB
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Account Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Software Access
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.trustAccounts.length ? (
                  detailClient.trustAccounts.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {t.accountName || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {t.bankName}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {t.bsb || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {t.accountNumber || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {t.hasSoftwareAccess ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      No trust accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Audits" && <AuditList clientId={clientId} />}
          {activeTab === "Activity Log" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Content
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-gray-800 dark:text-gray-100"
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.activityLogs.length ? (
                  detailClient.activityLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {log.type}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {log.content}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </ComponentCard>
    </DashboardPlaceholderPageTemplate>
  );
}
