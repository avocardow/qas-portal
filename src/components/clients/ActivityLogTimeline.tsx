"use client";

import React from 'react';

export interface ActivityLogEntry {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  userId: string;
}

interface ActivityLogTimelineProps {
  entries: ActivityLogEntry[];
}

export default function ActivityLogTimeline({ entries }: ActivityLogTimelineProps) {
  if (!entries || entries.length === 0) {
    return <p className="text-gray-500">No activity logs</p>;
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="p-4 bg-white border rounded-md shadow-sm">
          <div className="text-sm text-gray-500">
            {new Date(entry.createdAt).toLocaleString()}
          </div>
          <div className="mt-1 text-base text-gray-900">{entry.content}</div>
        </li>
      ))}
    </ul>
  );
} 