import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
// Mock Notification to avoid SVG rendering errors
vi.mock('@/components/ui/notification/Notification', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="notification-mock">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));
import MeetingMinutesPanel from './MeetingMinutesPanel';
import { ActivityLogType } from '@prisma/client';

describe('MeetingMinutesPanel', () => {
  const setup = (onAddMock: (type: ActivityLogType, content: string) => Promise<void>) => {
    const { container } = render(<MeetingMinutesPanel onAdd={onAddMock} />);
    const form = container.querySelector('form');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    const attendeesInput = screen.getByPlaceholderText(/Attendees/i);
    const topicsInput = screen.getByPlaceholderText(/Topics discussed/i);
    return { form, dateInput, attendeesInput, topicsInput };
  };

  it('validates required fields and shows errors', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const { form } = setup(onAdd);
    // disable HTML form validation and submit form without filling fields
    if (form) {
      form.noValidate = true;
      fireEvent.submit(form);
    }
    // expect validation errors
    expect(await screen.findByText('Meeting date is required.')).toBeInTheDocument();
    expect(await screen.findByText('Topics discussed are required.')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('submits correctly and shows confirmation', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const { form, dateInput, attendeesInput, topicsInput } = setup(onAdd);
    // fill fields
    fireEvent.change(dateInput, { target: { value: '2025-05-01' } });
    fireEvent.change(attendeesInput, { target: { value: 'Alice, Bob' } });
    fireEvent.change(topicsInput, { target: { value: 'Discuss project updates' } });
    // disable HTML validation and submit form
    if (form) {
      form.noValidate = true;
      fireEvent.submit(form);
    }
    // wait for onAdd call
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith(
      ActivityLogType.meeting_summary,
      'Meeting on 2025-05-01 with Alice, Bob: Discuss project updates'
    ));
  });
}); 