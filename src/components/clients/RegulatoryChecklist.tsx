"use client";
import React from "react";
import type { DocumentMetadata } from "@/components/common/DocumentReferences";
import { CheckCircleIcon, AlertIcon } from "@/icons";

export interface RegulatoryChecklistProps {
  documents: DocumentMetadata[];
}

export default function RegulatoryChecklist({ documents }: RegulatoryChecklistProps) {
  const requiredDocs = [
    { key: 'trust-deed', label: 'Trust Deed', match: /trust deed/i },
    { key: 'bank-statements', label: 'Bank Statements', match: /bank statement/i },
    { key: 'license', label: 'Primary License', match: /license/i },
    { key: 'identity', label: 'Identity Documents', match: /identity|passport|driver.*license/i },
    { key: 'contracts', label: 'Service Agreements', match: /agreement|contract/i },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Regulatory Checklist
        </h3>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {requiredDocs.map((item) => {
          const exists = documents.some((doc) => item.match.test(doc.fileName));
          return (
            <li
              key={item.key}
              className="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-400"
            >
              <span>{item.label}</span>
              {exists ? (
                <CheckCircleIcon className="h-5 w-5 text-success-600 dark:text-success-500" />
              ) : (
                <AlertIcon className="h-5 w-5 text-error-600 dark:text-error-500" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
} 