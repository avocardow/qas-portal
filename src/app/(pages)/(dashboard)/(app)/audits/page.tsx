"use client";
import React from "react";
import { usePermission } from "@/context/RbacContext";
import { AUDIT_PERMISSIONS } from "@/constants/permissions";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";

export default function AuditsPage() {
  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
  if (!canViewAudits) {
    return <p>You are not authorized to view audits.</p>;
  }
  return <DashboardPlaceholderPageTemplate heading="Audits" />;
}
