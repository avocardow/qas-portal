"use client";
import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";
import { usePermission, useRole } from "@/context/RbacContext";
import { TASK_PERMISSIONS, AUDIT_PERMISSIONS } from "@/constants/permissions";

export default function DashboardPage() {
  const role = useRole();
  const canViewClients =
    role === "Admin" || role === "Manager" || role === "Client";
  const canViewAudits = usePermission(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);

  return (
    <DashboardPlaceholderPageTemplate heading="Dashboard">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canViewClients && (
          <ComponentCard title="Clients">
            <p>Manage clients</p>
            <Link href="/clients">
              <button className="btn mt-2">Go to Clients</button>
            </Link>
          </ComponentCard>
        )}
        {canViewAudits && (
          <ComponentCard title="Audits">
            <p>View and manage audits</p>
            <Link href="/audits">
              <button className="btn mt-2">Go to Audits</button>
            </Link>
          </ComponentCard>
        )}
        {canViewTasks && (
          <ComponentCard title="Tasks">
            <p>View and manage tasks</p>
            <Link href="/tasks">
              <button className="btn mt-2">Go to Tasks</button>
            </Link>
          </ComponentCard>
        )}
      </div>
    </DashboardPlaceholderPageTemplate>
  );
}
