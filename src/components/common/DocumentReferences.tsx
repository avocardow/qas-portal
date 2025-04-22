"use client";
import React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export interface DocumentMetadata {
  id: string;
  fileName: string;
  sharepointFileUrl: string | null;
}

interface DocumentReferencesProps {
  documents: DocumentMetadata[];
}

export default function DocumentReferences({
  documents,
}: DocumentReferencesProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.fileName}</TableCell>
              <TableCell>
                {doc.sharepointFileUrl ? (
                  <Link
                    href={doc.sharepointFileUrl}
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
