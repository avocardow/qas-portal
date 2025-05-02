import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { Client } from '@prisma/client';

export interface ClientDetailsSectionProps { client: Client }
export default function ClientDetailsSection({ client }: ClientDetailsSectionProps) {
  return (
    <ComponentCard title="Client Details">
      <p>ABN: {client.abn ?? '-'}</p>
      <p>Address: {client.address ?? '-'}</p>
      <p>City: {client.city ?? '-'}</p>
      <p>Postcode: {client.postcode ?? '-'}</p>
      <p>Estimated Annual Fees: {client.estAnnFees != null ? client.estAnnFees.toString() : '-'}</p>
      <p>Next Contact Date: {client.nextContactDate ? new Date(client.nextContactDate).toLocaleDateString() : '-'}</p>
    </ComponentCard>
  );
} 