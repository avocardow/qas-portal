import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRegulatoryAlerts, RegulatoryAlert, ClientLicense } from './useRegulatoryAlerts';
import type { DocumentMetadata } from '@/components/common/DocumentReferences';

// Test component to utilize the hook
function TestComponent({ docs, licenses }: { docs: DocumentMetadata[]; licenses: ClientLicense[] }) {
  const alerts = useRegulatoryAlerts(docs, licenses);
  return <div data-testid="alerts">{JSON.stringify(alerts)}</div>;
}

describe('useRegulatoryAlerts', () => {
  const requiredKeys = ['trust-deed', 'bank-statements', 'license', 'identity', 'contracts'];

  it('detects missing required documents', () => {
    render(<TestComponent docs={[]} licenses={[]} />);
    const alerts: RegulatoryAlert[] = JSON.parse(screen.getByTestId('alerts').textContent || '[]');
    // Expect one error alert per required doc
    requiredKeys.forEach((key) => {
      expect(alerts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: `missing-${key}`, severity: 'error' }),
        ])
      );
    });
  });

  it('detects upcoming license renewals as warnings', () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const license: ClientLicense = { id: '1', licenseNumber: 'ABC123', renewalMonth: nextMonth };
    render(<TestComponent docs={[]} licenses={[license]} />);
    const alerts: RegulatoryAlert[] = JSON.parse(screen.getByTestId('alerts').textContent || '[]');
    // Should include missing docs + one renewal warning
    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: `renewal-${license.id}`, severity: 'warning' }),
      ])
    );
  });
}); 