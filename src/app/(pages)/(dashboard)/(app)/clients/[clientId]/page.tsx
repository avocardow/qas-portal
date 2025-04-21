"use client";
import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import { useParams } from "next/navigation";

export default function ClientDetailPage() {
  const { clientId } = useParams() as { clientId: string };
  return <DashboardPlaceholderPageTemplate heading={`Client ${clientId}`} />;
}
