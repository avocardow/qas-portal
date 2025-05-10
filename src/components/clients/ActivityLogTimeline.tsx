"use client";

import React from 'react';

export interface ActivityLogEntry {
  id: string;
  type: string;
  content: string;
  createdAt: string | Date;
  createdBy?: string | null;
  modifiedBy?: string | null;
}

interface ActivityLogTimelineProps {
  entries: ActivityLogEntry[];
}

export default function ActivityLogTimeline({ entries }: ActivityLogTimelineProps) {
  if (!entries || entries.length === 0) {
    return <p className="text-gray-500">No activity logs</p>;
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute top-6 bottom-0 left-4 w-px bg-gray-200 dark:bg-gray-800" />

      {entries.map((entry) => (
        <div key={entry.id} className="relative mb-6 flex">
          <div className="z-10 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {/* Dot indicator */}
              <div className="h-3 w-3 bg-gray-500 dark:bg-gray-400 rounded-full" />
            </div>
          </div>
          <div className="ml-4 flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                new Date(entry.createdAt)
              )}
            </span>
            <p className="text-base text-gray-900 dark:text-white/90 mt-1">
              {entry.content}
            </p>
            {entry.createdBy && (
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                Created by: {entry.createdBy}
              </p>
            )}
            {entry.modifiedBy && (
              <p className="text-xs text-gray-600 dark:text-gray-500">
                Modified by: {entry.modifiedBy}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 