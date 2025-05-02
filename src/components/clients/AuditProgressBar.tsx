"use client";
import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import ProgressBar from '@/components/progress-bar/ProgressBar';
import { useParams } from 'next/navigation';
import { useAuditCycle } from '@/hooks/useAuditCycle';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AuditProgressBar() {
  const { clientId } = useParams<{ clientId: string }>();
  const { cycleData, isLoading } = useAuditCycle(clientId);

  if (isLoading || !cycleData) {
    return null;
  }

  const { lastReportDueDate, nextReportDueDate, progress } = cycleData;

  return (
    <ComponentCard title="Audit Cycle Progress">
      <div className="mb-2 text-sm text-gray-500">
        <span>{dateFormatter.format(new Date(lastReportDueDate))}</span>
        <span className="mx-2">to</span>
        <span>{dateFormatter.format(new Date(nextReportDueDate))}</span>
      </div>
      <ProgressBar progress={Math.round(progress)} label="outside" />
    </ComponentCard>
  );
} 