"use client";

import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";

// Schema for creating a Task
const createTaskSchema = z.object({
  auditId: z.string().uuid("Invalid Audit ID"),
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  assignedUserId: z.string().uuid("Invalid User ID").optional(),
  dueDate: z.date().optional(),
  priority: z.string().optional(),
  requiresClientAction: z.boolean().optional(),
});
type CreateTaskForm = z.infer<typeof createTaskSchema>;

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAuditId = searchParams.get("auditId") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { auditId: defaultAuditId, requiresClientAction: false },
  });

  const createTask = api.task.create.useMutation();

  const onSubmit = (data: CreateTaskForm) => {
    createTask.mutate(data, {
      onSuccess: (task) => {
        router.push(`/tasks/${task.id}`);
      },
    });
  };

  return (
    <DashboardPlaceholderPageTemplate heading="New Task">
      <PageBreadcrumb pageTitle="New Task" />
      <ComponentCard title="Create Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Audit ID
            </label>
            <input
              {...register("auditId")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
            {errors.auditId && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.auditId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...register("name")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assignee User ID
            </label>
            <input
              {...register("assignedUserId")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              {...register("dueDate", { valueAsDate: true })}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <input
              {...register("priority")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("requiresClientAction")}
              className="text-brand-600 focus:ring-brand-500 mr-2 h-4 w-4"
            />
            <label className="text-sm font-medium text-gray-700">
              Requires Client Action
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="shadow-theme-xs bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </ComponentCard>
    </DashboardPlaceholderPageTemplate>
  );
}
