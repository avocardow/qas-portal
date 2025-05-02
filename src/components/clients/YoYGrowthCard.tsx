"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import ComponentCard from '@/components/common/ComponentCard';
import { ApexOptions } from 'apexcharts';
import { useAbility } from '@/hooks/useAbility';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';

// Dynamically import chart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface YoYGrowthCardProps {
  growthPercentage: number;
  growthHistory: Array<{ date: string; value: number }>;
}

export default function YoYGrowthCard({ growthPercentage, growthHistory }: YoYGrowthCardProps) {
  const { can } = useAbility();
  if (!can(CLIENT_PERMISSIONS.VIEW_BILLING)) {
    return (
      <ComponentCard title="YoY Growth">
        <p className="text-2xl font-semibold">-</p>
      </ComponentCard>
    );
  }
  const isPositive = growthPercentage >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

  const options: ApexOptions = {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { opacity: 0.3 },
    xaxis: { type: 'category', categories: growthHistory.map((pt) => pt.date) },
    tooltip: { x: { show: true }, y: { formatter: (val) => `${val.toLocaleString()}%` } },
  };

  const series = [{ name: 'Growth', data: growthHistory.map((pt) => pt.value) }];

  return (
    <ComponentCard title="YoY Growth">
      <div className="flex items-baseline space-x-2">
        <span className={`text-2xl font-semibold ${colorClass}`}>{arrow}</span>
        <span className={`text-2xl font-semibold ${colorClass}`}> {Math.abs(growthPercentage).toFixed(1)}%</span>
      </div>
      <div className="mt-2">
        <ReactApexChart options={options} series={series} type="area" height={80} />
      </div>
    </ComponentCard>
  );
} 