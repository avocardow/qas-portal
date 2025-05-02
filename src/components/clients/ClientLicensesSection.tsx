import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { ClientWithRelations } from './ClientOverviewCard';

export interface ClientLicensesSectionProps {
  licenses: ClientWithRelations['licenses'];
}

export default function ClientLicensesSection({ licenses }: ClientLicensesSectionProps) {
  if (!licenses || licenses.length === 0) {
    return (
      <ComponentCard title="Licenses">
        <p>No licenses available.</p>
      </ComponentCard>
    );
  }
  return (
    <ComponentCard title="Licenses">
      <ul>
        {licenses.map((license) => (
          <li key={license.id}>
            {license.licenseNumber}
            {license.licenseType ? ` (${license.licenseType})` : ''}
            {license.isPrimary ? ' (Primary)' : ''}
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
} 