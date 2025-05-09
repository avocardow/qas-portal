import React from 'react';
import { render, screen } from '@testing-library/react';
import ActivityLogTimeline, { ActivityLogEntry } from './ActivityLogTimeline';

describe('ActivityLogTimeline', () => {
  it('renders no logs message when entries empty', () => {
    render(<ActivityLogTimeline entries={[]} />);
    expect(screen.getByText(/no activity logs/i)).toBeInTheDocument();
  });

  it('renders entries list when entries provided', () => {
    const entries: ActivityLogEntry[] = [
      { id: '1', type: 'note', content: 'Test log entry', createdAt: '2025-01-01T12:00:00Z', userId: 'user1' },
    ];
    render(<ActivityLogTimeline entries={entries} />);
    expect(screen.getByText('Test log entry')).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
}); 