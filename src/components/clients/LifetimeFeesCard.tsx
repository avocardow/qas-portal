"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import ComponentCard from '@/components/common/ComponentCard';
import { ApexOptions } from 'apexcharts';
import { useAbility } from '@/hooks/useAbility';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';

// Dynamically import the chart component to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface LifetimeFeesCardProps {
  totalFees: number;
  feeHistory: Array<{ date: string; value: number }>;
}

export default function LifetimeFeesCard({ totalFees, feeHistory }: LifetimeFeesCardProps) {
  const { can } = useAbility();
  if (!can(CLIENT_PERMISSIONS.VIEW_BILLING)) {
    return (
      <ComponentCard title="Lifetime Fees">
        <p className="text-2xl font-semibold">-</p>
      </ComponentCard>
    );
  }
  // Chart configuration for sparkline trend
  const options: ApexOptions = {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { opacity: 0.3 },
    xaxis: {
      type: 'category',
      categories: feeHistory.map((point) => point.date),
    },
    tooltip: { x: { show: true }, y: { formatter: (val) => `$${val.toLocaleString()}` } },
  };

  const series = [
    { name: 'Fees', data: feeHistory.map((point) => point.value) },
  ];

  return (
    <ComponentCard title="Lifetime Fees">
      <p className="text-2xl font-semibold">
        {totalFees.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </p>
      <div className="mt-2">
        <ReactApexChart options={options} series={series} type="area" height={80} />
      </div>
    </ComponentCard>
  );
} 