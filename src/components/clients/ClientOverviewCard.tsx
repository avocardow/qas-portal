import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { Client } from '@prisma/client';

export interface ClientOverviewCardProps { client: Client }
const ClientOverviewCard: React.FC<ClientOverviewCardProps> = ({ client }) => {
  return (
    <ComponentCard title="Client Overview">
      <p>Name: {client.clientName}</p>
      <p>Status: {client.status}</p>
    </ComponentCard>
  );
};

export default ClientOverviewCard; 