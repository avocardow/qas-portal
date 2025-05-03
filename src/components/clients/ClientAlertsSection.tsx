import React from 'react';
import type { DocumentMetadata } from '@/components/common/DocumentReferences';
import { ClientLicense, useRegulatoryAlerts } from '@/hooks/useRegulatoryAlerts';
import Alert from '@/components/ui/alert/Alert';

export interface ClientAlertsSectionProps {
  documents: DocumentMetadata[];
  licenses: ClientLicense[];
}

export default function ClientAlertsSection({ documents, licenses }: ClientAlertsSectionProps) {
  const alerts = useRegulatoryAlerts(documents, licenses);
  if (alerts.length === 0) {
    return null;
  }
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Alerts & Warnings</h3>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.severity}
            title={alert.severity === 'error' ? 'Error' : 'Warning'}
            message={alert.message}
          />
        ))}
      </div>
    </div>
  );
} 