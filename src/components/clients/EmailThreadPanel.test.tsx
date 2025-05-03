import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmailThreadPanel from './EmailThreadPanel';
import type { EmailMessage } from '@/server/services/emailService';

describe('EmailThreadPanel', () => {
  it('shows loading spinner when loading', () => {
    const { container } = render(
      <EmailThreadPanel isLoading={true} isError={false} />
    );
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error message and retry button when error', () => {
    const onRetry = vi.fn();
    render(
      <EmailThreadPanel isLoading={false} isError={true} onRetry={onRetry} />
    );
    expect(screen.getByText(/Error loading email threads/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /retry/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows no threads message when there are no messages', () => {
    render(
      <EmailThreadPanel
        isLoading={false}
        isError={false}
        emailThreads={{ messages: [], nextLink: undefined }}
      />
    );
    expect(screen.getByText(/No recent email threads to display/i)).toBeInTheDocument();
  });

  it('renders list of email threads when data provided', () => {
    const msg: EmailMessage = {
      id: '1',
      subject: 'Test Subject',
      from: { emailAddress: { name: 'Alice' } },
      receivedDateTime: '2025-05-01T12:00:00Z',
      bodyPreview: 'Preview text',
    };
    render(
      <EmailThreadPanel
        isLoading={false}
        isError={false}
        emailThreads={{ messages: [msg] }}
      />
    );
    expect(screen.getByText(/Recent Email Threads/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Subject/i)).toBeInTheDocument();
    expect(screen.getByText(/From: Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview text/i)).toBeInTheDocument();
  });
}); 