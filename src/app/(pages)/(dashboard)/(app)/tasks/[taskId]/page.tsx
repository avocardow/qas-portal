"use client";

import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import ComponentCard from "@/components/common/ComponentCard";
import DocumentReferences from "@/components/common/DocumentReferences";
import { usePermission } from "@/context/RbacContext";
import { TASK_PERMISSIONS } from "@/constants/permissions";

export default function TaskPage() {
  const { taskId } = useParams() as { taskId: string };
  const canViewTasks = usePermission(TASK_PERMISSIONS.GET_ALL);
  if (!canViewTasks) {
    return <p>You are not authorized to view tasks.</p>;
  }
  const {
    data: task,
    isLoading,
    isError,
  } = api.task.getById.useQuery({ taskId });
  const {
    data: docResources,
    isLoading: isDocsLoading,
    isError: isDocsError,
  } = api.document.getByTaskId.useQuery({ taskId });

  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <p>Loading task...</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  if (isError || !task) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Error loading task.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  return (
    <DashboardPlaceholderPageTemplate heading={task.name}>
      <ComponentCard title="Documents">
        {isDocsLoading && <p>Loading documents...</p>}
        {isDocsError && <p>Error loading documents.</p>}
        {docResources && <DocumentReferences documents={docResources} />}
      </ComponentCard>
    </DashboardPlaceholderPageTemplate>
  );
}
