"use client";
import { useMemo } from 'react';
import type { DocumentMetadata } from '@/components/common/DocumentReferences';
import type { RouterOutput } from '@/utils/api';

export interface ClientLicense {
  id: string;
  licenseNumber: string;
  renewalMonth?: number | null;
}

export interface RegulatoryAlert {
  id: string;
  severity: 'error' | 'warning';
  message: string;
}

export function useRegulatoryAlerts(
  documents: DocumentMetadata[] = [],
  licenses: ClientLicense[] = []
): RegulatoryAlert[] {
  return useMemo(() => {
    const alerts: RegulatoryAlert[] = [];

    // Missing required documents
    const requiredDocs = [
      { key: 'trust-deed', label: 'Trust Deed', match: /trust deed/i },
      { key: 'bank-statements', label: 'Bank Statements', match: /bank statement/i },
      { key: 'license', label: 'Primary License', match: /license/i },
      { key: 'identity', label: 'Identity Documents', match: /identity|passport|driver.*license/i },
      { key: 'contracts', label: 'Service Agreements', match: /agreement|contract/i },
    ];
    requiredDocs.forEach((item) => {
      const exists = documents.some((doc) => item.match.test(doc.fileName));
      if (!exists) {
        alerts.push({
          id: `missing-${item.key}`,
          severity: 'error',
          message: `${item.label} is missing`,
        });
      }
    });

    // Upcoming license renewals (this month or next month)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
   licenses.forEach((lic) => {
      if (lic.renewalMonth) {
        if (lic.renewalMonth === currentMonth || lic.renewalMonth === nextMonth) {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
          ];
          const renewLabel = monthNames[(lic.renewalMonth - 1) % 12];
          alerts.push({
            id: `renewal-${lic.id}`,
            severity: 'warning',
            message: `License ${lic.licenseNumber} renews in ${renewLabel}`,
          });
        }
      }
    });

    return alerts;
  }, [documents, licenses]);
} 