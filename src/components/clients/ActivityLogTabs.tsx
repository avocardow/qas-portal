import React, { useState } from 'react';
import ActivityCard from './ActivityCard';
import type { RouterOutput } from '@/utils/api';
// Use tRPC output type for activity logs
type ActivityLogItem = NonNullable<RouterOutput['clients']['getById']['activityLogs']>[number];

interface ActivityLogTabsProps {
  logs?: ActivityLogItem[];
  pageSize?: number;
}

export default function ActivityLogTabs({ logs = [], pageSize = 5 }: ActivityLogTabsProps) {
  const categories = [
    { key: 'notes', title: 'Notes', filter: (log: ActivityLogItem) => log.type === 'note' },
    { key: 'emails', title: 'Emails', filter: (log: ActivityLogItem) => ['email_sent', 'email_received'].includes(log.type) },
    { key: 'calls', title: 'Calls', filter: (log: ActivityLogItem) => ['call_in', 'call_out'].includes(log.type) },
    { key: 'status', title: 'Status Changes', filter: (log: ActivityLogItem) => ['status_change', 'stage_change'].includes(log.type) },
  ];

  const [activeTab, setActiveTab] = useState<string>(categories[0].key);

  return (
    <div>
      <div className="rounded-t-xl border border-gray-200 p-3 dark:border-gray-800">
        <nav className="flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === cat.key
                  ? "shadow-theme-xs bg-white text-gray-900 dark:bg-white/[0.03] dark:text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="rounded-b-xl border border-t-0 border-gray-200 p-6 pt-4 dark:border-gray-800">
        {categories.map((cat) =>
          activeTab === cat.key ? (
            <ActivityCard key={cat.key} logs={logs.filter(cat.filter)} pageSize={pageSize} />
          ) : null
        )}
      </div>
    </div>
  );
}