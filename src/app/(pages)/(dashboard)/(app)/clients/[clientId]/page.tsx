/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type TabKey =
  | "Summary"
  | "Contacts"
  | "Licenses"
  | "Trust Accounts"
  | "Audits"
  | "Activity Log";

export default function ClientDetailPage() {
  const { clientId } = useParams() as { clientId: string };
  const {
    data: client,
    isLoading,
    isError,
  } = api.client.getById.useQuery({ clientId });

  const detailClient = client as any;
  const [activeTab, setActiveTab] = useState<TabKey>("Summary");

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
      <div className="mb-4 flex justify-end">
        <Link href={`/clients/${clientId}/edit`}>
          <button className="btn">Edit Client</button>
        </Link>
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
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="mt-4">
          {activeTab === "Summary" && (
            <div className="grid grid-cols-2 gap-4">
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
                  <TableCell isHeader>Name</TableCell>
                  <TableCell isHeader>Email</TableCell>
                  <TableCell isHeader>Phone</TableCell>
                  <TableCell isHeader>Title</TableCell>
                  <TableCell isHeader>Primary</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.contacts.length ? (
                  detailClient.contacts.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name || "-"}</TableCell>
                      <TableCell>{c.email || "-"}</TableCell>
                      <TableCell>{c.phone || "-"}</TableCell>
                      <TableCell>{c.title || "-"}</TableCell>
                      <TableCell>{c.isPrimary ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No contacts found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Licenses" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell isHeader>License Number</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Renewal Month</TableCell>
                  <TableCell isHeader>Primary</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.licenses.length ? (
                  detailClient.licenses.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.licenseNumber}</TableCell>
                      <TableCell>{l.licenseType || "-"}</TableCell>
                      <TableCell>{l.renewalMonth ?? "-"}</TableCell>
                      <TableCell>{l.isPrimary ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>No licenses found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Trust Accounts" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell isHeader>Account Name</TableCell>
                  <TableCell isHeader>Bank Name</TableCell>
                  <TableCell isHeader>BSB</TableCell>
                  <TableCell isHeader>Account Number</TableCell>
                  <TableCell isHeader>Software Access</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.trustAccounts.length ? (
                  detailClient.trustAccounts.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.accountName || "-"}</TableCell>
                      <TableCell>{t.bankName}</TableCell>
                      <TableCell>{t.bsb || "-"}</TableCell>
                      <TableCell>{t.accountNumber || "-"}</TableCell>
                      <TableCell>
                        {t.hasSoftwareAccess ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No trust accounts found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Audits" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell isHeader>Year</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Stage</TableCell>
                  <TableCell isHeader>Report Due</TableCell>
                  <TableCell isHeader>Lodged Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.audits.length ? (
                  detailClient.audits.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.auditYear}</TableCell>
                      <TableCell>{a.status?.name || "-"}</TableCell>
                      <TableCell>{a.stage?.name || "-"}</TableCell>
                      <TableCell>
                        {a.reportDueDate
                          ? new Date(a.reportDueDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {a.lodgedWithOFTDate
                          ? new Date(a.lodgedWithOFTDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No audits found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {activeTab === "Activity Log" && (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Content</TableCell>
                  <TableCell isHeader>Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {detailClient.activityLogs.length ? (
                  detailClient.activityLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.content}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No activity logs found.</TableCell>
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
