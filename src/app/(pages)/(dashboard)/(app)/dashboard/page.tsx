"use client";
import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";
import { useAbility } from "@/hooks/useAbility";
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import { TASK_PERMISSIONS, AUDIT_PERMISSIONS } from "@/constants/permissions";
import Authorized from "@/components/Authorized";

export default function DashboardPage() {
  const { can } = useAbility();
  const canViewClients = can(CLIENT_PERMISSIONS.VIEW);
  const canViewAudits = can(AUDIT_PERMISSIONS.GET_BY_CLIENT_ID);
  const canViewTasks = can(TASK_PERMISSIONS.GET_ALL);

  return (
    <DashboardPlaceholderPageTemplate heading="Dashboard">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Authorized action={"clients.view.status"} fallback={null}>
        {canViewClients && (
          <ComponentCard title="Clients">
            <p>Manage clients</p>
            <Link href="/clients">
              <button className="btn mt-2">Go to Clients</button>
            </Link>
          </ComponentCard>
        )}
        </Authorized>
        <Authorized action={AUDIT_PERMISSIONS.GET_BY_CLIENT_ID} fallback={null}>
        {canViewAudits && (
          <ComponentCard title="Audits">
            <p>View and manage audits</p>
            <Link href="/audits">
              <button className="btn mt-2">Go to Audits</button>
            </Link>
          </ComponentCard>
        )}
        </Authorized>
        <Authorized action={TASK_PERMISSIONS.GET_ALL} fallback={null}>
        {canViewTasks && (
          <ComponentCard title="Tasks">
            <p>View and manage tasks</p>
            <Link href="/tasks">
              <button className="btn mt-2">Go to Tasks</button>
            </Link>
          </ComponentCard>
        )}
        </Authorized>
      </div>
    </DashboardPlaceholderPageTemplate>
  );
}
