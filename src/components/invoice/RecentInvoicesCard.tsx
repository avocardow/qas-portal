"use client";
import React from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { api } from "@/utils/api";

interface RecentInvoicesCardProps {
  clientId: string;
}

export default function RecentInvoicesCard({ clientId }: RecentInvoicesCardProps) {
  const { data, isLoading, isError } = api.document.getByClientId.useQuery({ clientId });

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading invoices...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load invoices.</div>;
  }

  // Filter PDF documents as invoices and limit to last 5
  const invoices = data
    ?.filter((doc) => doc.fileName.toLowerCase().endsWith(".pdf"))
    .slice(0, 5) ?? [];

  if (invoices.length === 0) {
    return <div className="p-4 text-gray-500">No invoices available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.fileName}</TableCell>
              <TableCell>
                {invoice.sharepointFileUrl ? (
                  <Link
                    href={invoice.sharepointFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open
                  </Link>
                ) : (
                  <span className="text-gray-500">Unavailable</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 