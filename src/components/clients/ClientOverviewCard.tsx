import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { RouterOutput } from '@/utils/api';

// Use the return type from the clients.getById tRPC call to include relations
export type ClientWithRelations = RouterOutput['clients']['getById'];

export interface ClientOverviewCardProps { client: ClientWithRelations }
const ClientOverviewCard: React.FC<ClientOverviewCardProps> = ({ client }) => {
  return (
    <ComponentCard title="Client Overview">
      <p>Name: {client.clientName}</p>
      <p>Status: {client.status}</p>
    </ComponentCard>
  );
};

export default ClientOverviewCard; 