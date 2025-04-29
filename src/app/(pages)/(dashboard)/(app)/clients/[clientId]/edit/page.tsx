"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useAbility } from "@/hooks/useAbility";

// Zod schema for validation
const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  abn: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  status: z.enum(["prospect", "active", "archived"]),
  auditMonthEnd: z.number().int().optional(),
  nextContactDate: z.string().optional(),
  estAnnFees: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditClientPage() {
  const { can } = useAbility();
  const router = useRouter();
  const { clientId } = useParams() as { clientId: string };

  // Fetch existing client data
  const clientQuery = api.clients.getById.useQuery({ clientId });

  // Setup form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (clientQuery.data) {
      const c = clientQuery.data;
      reset({
        clientName: c.clientName,
        abn: c.abn || "",
        address: c.address || "",
        city: c.city || "",
        postcode: c.postcode || "",
        status: c.status as "prospect" | "active" | "archived",
        auditMonthEnd: c.auditMonthEnd || undefined,
        nextContactDate: c.nextContactDate
          ? new Date(c.nextContactDate).toISOString().slice(0, 10)
          : "",
        estAnnFees: c.estAnnFees ? Number(c.estAnnFees) : undefined,
      });
    }
  }, [clientQuery.data, reset]);

  // tRPC mutation for update
  const updateMutation = api.clients.update.useMutation();

  const onSubmit = async (data: FormData) => {
    try {
      await updateMutation.mutateAsync({
        clientId,
        ...data,
        nextContactDate: data.nextContactDate
          ? new Date(data.nextContactDate)
          : undefined,
      });
      router.push(`/clients/${clientId}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Guard after hooks using permission checks
  if (!can("clients.view.status")) {
    return <p>You are not authorized to edit clients.</p>;
  }
  if (clientQuery.isLoading) {
    return <p>Loading client...</p>;
  }
  if (clientQuery.isError) {
    return <p>Error loading client.</p>;
  }

  return (
    <DashboardPlaceholderPageTemplate heading="Edit Client">
      <PageBreadcrumb pageTitle="Edit Client" />
      <ComponentCard title="Edit Client">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              {...register("clientName")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
            {errors.clientName && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.clientName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ABN
            </label>
            <input
              {...register("abn")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              {...register("address")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              {...register("city")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Postcode
            </label>
            <input
              {...register("postcode")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register("status")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            >
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Audit Month End
            </label>
            <input
              type="number"
              {...register("auditMonthEnd", { valueAsNumber: true })}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Next Contact Date
            </label>
            <input
              type="date"
              {...register("nextContactDate")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estimated Annual Fees
            </label>
            <input
              type="number"
              step="0.01"
              {...register("estAnnFees", { valueAsNumber: true })}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? "Updating..." : "Update Client"}
          </button>
        </form>
      </ComponentCard>
    </DashboardPlaceholderPageTemplate>
  );
}
