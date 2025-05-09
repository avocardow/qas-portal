"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useClientData } from "@/hooks/useClientData";
import type { RouterOutput } from "@/utils/api";

interface CurrentFeesCardProps {
  clientId: string;
}

export default function CurrentFeesCard({ clientId }: CurrentFeesCardProps) {
  const { data: rawData, isLoading, isError, error } = useClientData(clientId);

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

  // Cast rawData to typed ClientById for proper property access
  type ClientById = RouterOutput["clients"]["getById"];
  const client = rawData as ClientById | undefined;
  const fees = client?.estAnnFees;
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