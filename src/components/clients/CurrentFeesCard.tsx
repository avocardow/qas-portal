"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useClientData } from "@/hooks/useClientData";

interface CurrentFeesCardProps {
  clientId: string;
}

export default function CurrentFeesCard({ clientId }: CurrentFeesCardProps) {
  const { data, isLoading, isError, error } = useClientData(clientId);

  if (isLoading) {
    return <ComponentCard title="Current Fees">Loading...</ComponentCard>;
  }

  if (isError) {
    return (
      <ComponentCard title="Current Fees">
        <p>Error loading fees: {error instanceof Error ? error.message : String(error)}</p>
      </ComponentCard>
    );
  }

  const fees = data?.estAnnFees;
  if (fees == null) {
    return (
      <ComponentCard title="Current Fees">
        <p>No fees available.</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Current Fees">
      <div className="text-xl font-semibold">
        {fees.toLocaleString(undefined, { style: "currency", currency: "USD" })}
      </div>
    </ComponentCard>
  );
} 