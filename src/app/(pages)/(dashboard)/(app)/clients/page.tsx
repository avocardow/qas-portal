"use client";
import React from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function ClientsPage() {
  const clientsQuery = api.client.getAll.useQuery({});
  const items = clientsQuery.data?.items;
  const isLoading = clientsQuery.isLoading;
  const error = clientsQuery.error;

  return (
    <div>
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-6">
        <ComponentCard title="Clients">
          {isLoading && <p>Loading...</p>}
          {error && <p>Error loading clients.</p>}
          {!items?.length && !isLoading && !error && <p>No clients found.</p>}
          {items && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                    >
                      ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                    >
                      City
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 bg-white">
                  {items.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="px-6 py-4 text-start text-sm text-gray-500">
                        {client.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-start text-sm text-blue-600">
                        <Link href={`/clients/${client.id}`}>
                          {client.clientName}
                        </Link>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-start text-sm text-gray-500">
                        {client.city ?? "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-start text-sm text-gray-500">
                        {client.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
