import React from 'react';
import { Tab } from '@headlessui/react';
import ActivityCard from './ActivityCard';
import type { RouterOutput } from '@/utils/api';
// Use tRPC output type for activity logs
type ActivityLogItem = RouterOutput['clients']['getById']['activityLogs'][number];

interface ActivityLogTabsProps {
  logs?: ActivityLogItem[];
  pageSize?: number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ActivityLogTabs({ logs = [], pageSize = 5 }: ActivityLogTabsProps) {
  const categories = [
    { key: 'notes', title: 'Notes', filter: (log: ActivityLogItem) => log.type === 'note' },
    { key: 'emails', title: 'Emails', filter: (log: ActivityLogItem) => ['email_sent', 'email_received'].includes(log.type) },
    { key: 'calls', title: 'Calls', filter: (log: ActivityLogItem) => ['call_in', 'call_out'].includes(log.type) },
    { key: 'status', title: 'Status Changes', filter: (log: ActivityLogItem) => ['status_change', 'stage_change'].includes(log.type) },
  ];

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {categories.map((cat) => (
          <Tab
            key={cat.key}
            className={({ selected }) =>
              classNames(
                'w-full py-2.5 text-sm font-medium leading-5 text-center',
                selected
                  ? 'bg-white shadow text-gray-900 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )
            }
          >
            {cat.title}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {categories.map((cat) => (
          <Tab.Panel key={cat.key} className="focus:outline-none">
            <ActivityCard logs={logs.filter(cat.filter)} pageSize={pageSize} />
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}