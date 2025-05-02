"use client";
import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';

export interface HealthScoreCardProps {
  score: number;
}

export default function HealthScoreCard({ score }: HealthScoreCardProps) {
  // Determine status and color based on score
  const status = score >= 80 ? 'Good' : score >= 50 ? 'Moderate' : 'Poor';
  const colorClass =
    score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <ComponentCard title="Health Score" className="relative">
      {/* Ribbon indicating status */}
      <span
        className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold text-white ${colorClass} rounded-md`}
      >
        {status}
      </span>
      {/* Display score percentage */}
      <p className="text-3xl font-semibold">{score}%</p>
    </ComponentCard>
  );
} 