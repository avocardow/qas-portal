/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { useRbac } from "@/context/RbacContext";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import AuditList from "@/components/audit/AuditList";
import DocumentReferences from "@/components/common/DocumentReferences";
import { TabButton } from "@/components/ui/tabs/TabWithUnderline";
import Badge from "@/components/ui/badge/Badge";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

type TabKey =
  | "Summary"
  | "Contacts"
  | "Licenses"
  | "Trust Accounts"
  | "Audits"
  | "Activity Log"
  | "Documents";

export default function ContactDetailPage() {
  const { contactId } = useParams() as { contactId: string };
  const router = useRouter();
  const deleteContactMutation = api.contacts.deleteContact.useMutation();
  const {
    data: contact,
    isLoading,
    isError,
  } = api.contacts.getById.useQuery({ contactId });
  const { role } = useRbac();
  const { isOpen, openModal, closeModal } = useModal();
  // Folder selection state and queries
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const {
    data: folders,
    isLoading: loadingFolders,
    error: foldersError,
  } = api.sharepoint.listContactFolders.useQuery(undefined, {
    enabled: isOpen,
  });
  const linkFolderMutation =
    api.contacts.updateSharepointFolderId.useMutation();
  const handleLinkFolder = () => {
    if (selectedFolderId) {
      linkFolderMutation.mutate(
        { contactId, sharepointFolderId: selectedFolderId },
        {
          onSuccess: () => {
            closeModal();
            router.refresh();
          },
          onError: (error) => console.error(error),
        }
      );
    }
  };

  const detailContact = contact as any;
  const [activeTab, setActiveTab] = useState<TabKey>("Summary");
  const {
    data: docResources,
    isLoading: isDocsLoading,
    isError: isDocsError,
  } = api.document.getByContactId.useQuery({ contactId });
  // SharePoint folder contents for Documents tab
  const {
    data: spItems,
    isLoading: spLoading,
    isError: spIsError,
  } = api.sharepoint.getFolderContents.useQuery(
    { folderId: contact?.sharepointFolderId ?? "" },
    {
      enabled:
        activeTab === "Documents" && Boolean(contact?.sharepointFolderId),
    }
  );

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteContactMutation.mutate(
        { contactId },
        {
          onSuccess: () => {
            router.push("/contacts");
          },
          onError: (error) => {
            console.error(error);
          },
        }
      );
    }
  };

  if (role !== "Admin" && role !== "Manager" && role !== "Contact") {
    return <p>You are not authorized to view contact details.</p>;
  }

  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <p>Loading contact...</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  if (isError || !contact) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Error loading contact.</p>
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
    "Documents",
  ];

  return (
    <DashboardPlaceholderPageTemplate
      heading={contact.contactName}
      className="max-w-4xl"
    >
      <PageBreadcrumb pageTitle={contact.contactName} />
      <div className="mb-4 flex justify-end space-x-2">
        {role === "Admin" && (
          <>
            <Link href={`/contacts/${contactId}/edit`}>
              <button className="btn bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800">
                Edit Contact
              </button>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteContactMutation.status === "pending"}
              className="btn bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
            >
              {deleteContactMutation.status === "pending"
                ? "Deleting..."
                : "Delete Contact"}
            </button>
          </>
        )}
        {(role === "Admin" || role === "Manager") && (
          <button
            onClick={openModal}
            className="btn bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:text-white dark:hover:bg-green-800"
          >
            {contact?.sharepointFolderId
              ? "Change SharePoint Folder"
              : "Link SharePoint Folder"}
          </button>
        )}
      </div>
      <ComponentCard title="Contact Details">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab}
                id={tab}
                label={tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </nav>
        </div>
        <div className="mt-4">
          {activeTab === "Summary" && (
            <div className="grid grid-cols-1 gap-4 text-gray-900 md:grid-cols-2 dark:text-gray-100">
              <div>
                <strong>Name:</strong> {contact.contactName}
              </div>
              <div>
                <strong>ABN:</strong> {contact.abn || "-"}
              </div>
              <div>
                <strong>Address:</strong> {contact.address || "-"}
              </div>
              <div>
                <strong>City:</strong> {contact.city || "-"}
              </div>
              <div>
                <strong>Postcode:</strong> {contact.postcode || "-"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <Badge size="sm">{contact.status}</Badge>
              </div>
              <div>
                <strong>Audit Month End:</strong> {contact.auditMonthEnd ?? "-"}
              </div>
              <div>
                <strong>Next Contact Date:</strong>{" "}
                {contact.nextContactDate
                  ? new Date(contact.nextContactDate).toLocaleDateString()
                  : "-"}
              </div>
              <div>
                <strong>Estimated Annual Fees:</strong>{" "}
                {contact.estAnnFees ? contact.estAnnFees.toString() : "-"}
              </div>
            </div>
          )}
          {activeTab === "Contacts" && (
            <div className="overflow-x-auto">
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
                  {detailContact.contacts.length ? (
                    detailContact.contacts.map((c: any) => (
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
                          <Badge
                            size="sm"
                            color={c.isPrimary ? "success" : "dark"}
                          >
                            {c.isPrimary ? "Yes" : "No"}
                          </Badge>
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
            </div>
          )}
          {activeTab === "Licenses" && (
            <div className="overflow-x-auto">
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
                  {detailContact.licenses.length ? (
                    detailContact.licenses.map((l: any) => (
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
                          <Badge
                            size="sm"
                            color={l.isPrimary ? "success" : "dark"}
                          >
                            {l.isPrimary ? "Yes" : "No"}
                          </Badge>
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
            </div>
          )}
          {activeTab === "Trust Accounts" && (
            <div className="overflow-x-auto">
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
                  {detailContact.trustAccounts.length ? (
                    detailContact.trustAccounts.map((t: any) => (
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
                          <Badge
                            size="sm"
                            color={t.hasSoftwareAccess ? "success" : "dark"}
                          >
                            {t.hasSoftwareAccess ? "Yes" : "No"}
                          </Badge>
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
            </div>
          )}
          {activeTab === "Audits" && <AuditList contactId={contactId} />}
          {activeTab === "Activity Log" && (
            <div className="overflow-x-auto">
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
                  {detailContact.activityLogs.length ? (
                    detailContact.activityLogs.map((log: any) => (
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
            </div>
          )}
          {activeTab === "Documents" && (
            <>
              {contact?.sharepointFolderId ? (
                <>
                  {spLoading && <p>Loading folder contents...</p>}
                  {spIsError && <p>Error loading folder contents.</p>}
                  {spItems && (
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800">
                        <TableRow>
                          <TableCell isHeader>Name</TableCell>
                          <TableCell isHeader>Type</TableCell>
                          <TableCell isHeader>Last Modified</TableCell>
                          <TableCell isHeader>Open in Web</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                        {spItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {item.isFolder ? "Folder" : "File"}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                item.lastModifiedDateTime
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <a
                                href={item.webUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Open
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              ) : (
                <>
                  {isDocsLoading && <p>Loading documents...</p>}
                  {isDocsError && <p>Error loading documents.</p>}
                  {docResources && (
                    <DocumentReferences documents={docResources} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </ComponentCard>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg">
        <div className="p-4">
          <h2 className="text-lg font-semibold">
            {contact?.sharepointFolderId
              ? "Change SharePoint Folder"
              : "Link SharePoint Folder"}
          </h2>
          {loadingFolders && <p>Loading folders...</p>}
          {foldersError && <p>Error loading folders: {foldersError.message}</p>}
          {folders && (
            <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
              {folders.map((folder) => (
                <li key={folder.id}>
                  <button
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full rounded px-2 py-1 text-left ${
                      selectedFolderId === folder.id
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {folder.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleLinkFolder}
              disabled={
                !selectedFolderId || linkFolderMutation.status === "pending"
              }
              className="btn bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
            >
              {linkFolderMutation.status === "pending"
                ? "Linking..."
                : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardPlaceholderPageTemplate>
  );
}
