"use client";
import React, { useState } from 'react';
import { ActivityLogType } from '@prisma/client';
import Notification from '@/components/ui/notification/Notification';

interface MeetingMinutesPanelProps {
  onAdd: (type: ActivityLogType, content: string) => Promise<void>;
}

export default function MeetingMinutesPanel({ onAdd }: MeetingMinutesPanelProps) {
  const [date, setDate] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('');
  const [topics, setTopics] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dateError, setDateError] = useState<string>('');
  const [topicsError, setTopicsError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setDateError(''); setTopicsError('');
    let valid = true;
    if (!date) { setDateError('Meeting date is required.'); valid = false; }
    if (!topics.trim()) { setTopicsError('Topics discussed are required.'); valid = false; }
    if (!valid) return;
    setIsSubmitting(true);
    try {
      const content = `Meeting on ${date}${attendees ? ` with ${attendees}` : ''}: ${topics.trim()}`;
      await onAdd(ActivityLogType.meeting_summary, content);
      setDate(''); setAttendees(''); setTopics('');
      // Show confirmation notification
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (err) {
      console.error('Error adding meeting minutes:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {showConfirmation && (
        <Notification
          variant="success"
          title="Meeting minutes recorded"
          description="Your meeting notes have been added to the activity log."
        />
      )}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2 mb-4">
        <div className="flex flex-col sm:flex-row sm:space-x-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="mb-2 rounded border px-2 py-1 sm:mb-0"
            required
          />
          {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
          <input
            type="text"
            placeholder="Attendees (comma separated)"
            value={attendees}
            onChange={e => setAttendees(e.target.value)}
            className="rounded border px-2 py-1 flex-1"
          />
        </div>
        <textarea
          placeholder="Topics discussed"
          value={topics}
          onChange={e => setTopics(e.target.value)}
          className="rounded border px-2 py-1 w-full"
          rows={3}
          required
        />
        {topicsError && <p className="text-red-500 text-sm">{topicsError}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !date || !topics.trim()}
          className="self-end rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Add Meeting Minutes'}
        </button>
      </form>
    </>
  );
} 