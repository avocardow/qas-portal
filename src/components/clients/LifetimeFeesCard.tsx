"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import ComponentCard from '@/components/common/ComponentCard';
import { ApexOptions } from 'apexcharts';
import { useAbility } from '@/hooks/useAbility';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import { computeLinearForecast, DataPoint } from '@/utils/forecast';

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
  // Compute projection for next 12 months
  const projection: DataPoint[] = computeLinearForecast(feeHistory, 12);
  // Combine categories and series data
  const categories = [...feeHistory.map((point) => point.date), ...projection.map((p) => p.date)];
  const actualSeries = feeHistory.map((point) => point.value);
  const projectionSeries = projection.map((p) => p.value);

  // Chart configuration for sparkline trend with projection overlay
  const options: ApexOptions = {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { curve: 'smooth', width: [2, 2], dashArray: [0, 4] },
    fill: { opacity: [0.3, 0.2] },
    xaxis: {
      type: 'category',
      categories: categories,
    },
    tooltip: {
      x: { show: true },
      y: {
        formatter: (val, { seriesIndex }) => seriesIndex === 1 ? `Proj: $${val.toLocaleString()}` : `$${val.toLocaleString()}`,
      },
    },
  };

  const series = [
    { name: 'Fees', data: actualSeries },
    { name: 'Projection', data: projectionSeries },
  ];

  return (
    <ComponentCard title="Lifetime Fees">
      <p className="text-2xl font-semibold">
        {totalFees.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </p>
      <div className="mt-2">
        <ReactApexChart options={options} series={series} type="area" height={100} />
      </div>
    </ComponentCard>
  );
} 