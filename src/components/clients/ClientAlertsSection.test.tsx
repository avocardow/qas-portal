import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientAlertsSection from './ClientAlertsSection';
import type { DocumentMetadata } from '@/components/common/DocumentReferences';
import type { ClientLicense } from '@/hooks/useRegulatoryAlerts';

// Helper to create a matching document entry
const makeDoc = (fileName: string): DocumentMetadata => ({ id: fileName, fileName, sharepointFileUrl: null });

describe('ClientAlertsSection', () => {
  it('renders nothing when there are no alerts', () => {
    // Provide documents matching all required items
    const docs: DocumentMetadata[] = [
      makeDoc('trust deed'),
      makeDoc('bank statement'),
      makeDoc('license'),
      makeDoc('driver license'),
      makeDoc('agreement'),
    ];
    render(<ClientAlertsSection documents={docs} licenses={[]} />);
    // Header should not be in the document
    expect(screen.queryByText('Alerts & Warnings')).toBeNull();
  });

  it('renders error and warning alerts when issues exist', () => {
    // No docs to trigger missing document errors
    const docs: DocumentMetadata[] = [];
    // One license renewing next month to trigger warning
    const now = new Date();
    const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
    const licenses: ClientLicense[] = [
      { id: 'lic1', licenseNumber: 'ABC123', renewalMonth: nextMonth },
    ];
    render(<ClientAlertsSection documents={docs} licenses={licenses} />);
    // Header should be present
    expect(screen.getByText('Alerts & Warnings')).toBeInTheDocument();
    // Expect error alert for missing Trust Deed
    expect(screen.getByText('Trust Deed is missing')).toBeInTheDocument();
    // Expect warning for license renewal
    expect(screen.getByText(/License ABC123 renews in/)).toBeInTheDocument();
  });
}); 