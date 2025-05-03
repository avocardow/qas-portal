"use client";
import React, { useState } from 'react';
import { ActivityLogType } from '@prisma/client';

interface MeetingMinutesPanelProps {
  onAdd: (type: ActivityLogType, content: string) => Promise<void>;
}

export default function MeetingMinutesPanel({ onAdd }: MeetingMinutesPanelProps) {
  const [date, setDate] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('');
  const [topics, setTopics] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !topics.trim()) return;
    setIsSubmitting(true);
    try {
      const content = `Meeting on ${date}${attendees ? ` with ${attendees}` : ''}: ${topics.trim()}`;
      await onAdd(ActivityLogType.meeting_summary, content);
      setDate('');
      setAttendees('');
      setTopics('');
    } catch (err) {
      console.error('Error adding meeting minutes:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2 mb-4">
      <div className="flex flex-col sm:flex-row sm:space-x-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="mb-2 rounded border px-2 py-1 sm:mb-0"
          required
        />
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
      <button
        type="submit"
        disabled={isSubmitting || !date || !topics.trim()}
        className="self-end rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Add Meeting Minutes'}
      </button>
    </form>
  );
} 