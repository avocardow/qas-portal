import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import type { ClientWithRelations } from './ClientOverviewCard';

export interface ClientTrustAccountsSectionProps {
  trustAccounts: ClientWithRelations['trustAccounts'];
}

export default function ClientTrustAccountsSection({ trustAccounts }: ClientTrustAccountsSectionProps) {
  if (!trustAccounts || trustAccounts.length === 0) {
    return (
      <ComponentCard title="Trust Accounts">
        <p>No trust accounts available.</p>
      </ComponentCard>
    );
  }
  return (
    <ComponentCard title="Trust Accounts">
      <ul>
        {trustAccounts.map((account) => (
          <li key={account.id}>
            {account.bankName}{account.accountName ? ` - ${account.accountName}` : ''}
          </li>
        ))}
      </ul>
    </ComponentCard>
  );
} 