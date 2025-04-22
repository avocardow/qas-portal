"use client";

import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

export function useTasks({
  page = 1,
  pageSize = 10,
  sortBy,
  sortOrder,
  status,
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
} = {}) {
  const { data: session, status: authStatus } = useSession();
  const isAdmin = session?.user?.role === "Admin";

  const query = isAdmin
    ? api.task.getAll.useQuery({ page, pageSize, sortBy, sortOrder, status })
    : api.task.getAssignedToMe.useQuery({
        page,
        pageSize,
        sortBy,
        sortOrder,
        status,
      });

  return { ...query, authStatus };
}
