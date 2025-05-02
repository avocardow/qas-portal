"use client";
import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Checkbox from '@/components/form/input/Checkbox';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { MoreDotIcon } from '@/icons';
import { useParams } from 'next/navigation';
import { useAuditCycle } from '@/hooks/useAuditCycle';
import { AuditScheduleItem } from '@/types/audit';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

export default function AuditScheduleCard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { schedule, isLoading } = useAuditCycle(clientId);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const initial: Record<string, boolean> = {};
      schedule.forEach((item: AuditScheduleItem) => {
        initial[item.id] = false;
      });
      setCheckedItems(initial);
    }
  }, [isLoading, schedule]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  if (isLoading) return null;

  return (
    <ComponentCard title="Upcoming Audit Schedule">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Upcoming Schedule</h3>
        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem onItemClick={closeDropdown}>View More</DropdownItem>
            <DropdownItem onItemClick={closeDropdown}>Delete</DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-[500px] xl:min-w-full">
          <div className="flex flex-col gap-2">
            {schedule.map((item: AuditScheduleItem) => (
              <div
                key={item.id}
                className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <Checkbox
                  className="size-5 rounded-md"
                  checked={checkedItems[item.id]}
                  onChange={() =>
                    setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                />
                <div>
                  <span className="text-theme-xs mb-0.5 block text-gray-500 dark:text-gray-400">
                    {dateFormatter.format(new Date(item.dueDate))}
                  </span>
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                    {timeFormatter.format(new Date(item.dueDate))}
                  </span>
                </div>
                <div>
                  <span className="text-theme-sm mb-1 block font-medium text-gray-700 dark:text-gray-400">
                    Audit {item.auditYear}
                  </span>
                  <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {item.stageName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ComponentCard>
  );
} 