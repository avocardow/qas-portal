import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Authorized from '@/components/Authorized';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
// import type { Client } from '@prisma/client';
import type { ClientWithRelations } from './ClientOverviewCard';

export interface ClientDetailsSectionProps { client: ClientWithRelations }

export default function ClientDetailsSection({ client }: ClientDetailsSectionProps) {
  return (
    <ComponentCard title="Client Details">
      <p>ABN: {client.abn ?? '-'}</p>
      <p>Address: {client.address ?? '-'}</p>
      <p>City: {client.city ?? '-'}</p>
      <p>Postcode: {client.postcode ?? '-'}</p>
      <Authorized action={CLIENT_PERMISSIONS.VIEW_BILLING} fallback={<p>Estimated Annual Fees: -</p>}>
        <p>Estimated Annual Fees: {client.estAnnFees != null ? client.estAnnFees.toString() : '-'}</p>
      </Authorized>
      <p>Next Contact Date: {client.nextContactDate ? new Date(client.nextContactDate).toLocaleDateString() : '-'}</p>
    </ComponentCard>
  );
} 