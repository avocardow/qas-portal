"use client";
import React, { useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';

// Props for ActivityCard: logs array with id, content, createdAt, and optional pageSize
interface ActivityCardProps {
  logs: Array<{ id: string; content: string; createdAt: string | Date }>;
  pageSize?: number;
}

export default function ActivityCard({ logs, pageSize = 5 }: ActivityCardProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(logs.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pageLogs = logs.slice(startIndex, startIndex + pageSize);

  return (
    <ComponentCard title="Activity Log">
      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute bottom-10 left-4 top-6 w-px bg-gray-200 dark:bg-gray-800"></div>

        {pageLogs.map((log) => (
          <div key={log.id} className="relative mb-6 flex">
            <div className="z-10 shrink-0">
              <div className="size-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                {/* Dot indicator */}
                <div className="h-3 w-3 bg-gray-500 dark:bg-gray-400 rounded-full" />
              </div>
            </div>
            <div className="ml-4 flex flex-col">
              <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                  new Date(log.createdAt)
                )}
              </span>
              <p className="text-theme-sm text-gray-800 dark:text-white/90 mt-1">
                {log.content}
              </p>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-800 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="text-theme-xs text-gray-500 disabled:text-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="text-theme-xs text-gray-500 disabled:text-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}