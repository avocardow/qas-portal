// This is a server component page

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TaskList from "@/components/task/task-list/TaskList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | Dashboard",
  description: "Dashboard tasks page styled after TailAdmin template",
};

export default function TasksPage() {
  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Task List" />
      <TaskList />
    </div>
  );
}
