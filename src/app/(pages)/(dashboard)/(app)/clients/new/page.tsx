"use client";
import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

// Define form schema
const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  abn: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  status: z.enum(["prospect", "active", "archived"]),
  auditMonthEnd: z.number().int().optional(),
  nextContactDate: z.string().optional(), // date input returns string
  estAnnFees: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "prospect" },
  });

  // tRPC mutation for client creation
  const createClientMutation = api.client.create.useMutation();
  const onSubmit = (data: FormData) => {
    // Convert nextContactDate to Date
    const input = {
      ...data,
      nextContactDate: data.nextContactDate
        ? new Date(data.nextContactDate)
        : undefined,
    };
    createClientMutation.mutate(input, {
      onSuccess: (created) => {
        router.push(`/clients/${created.id}`);
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  return (
    <DashboardPlaceholderPageTemplate heading="New Client">
      <PageBreadcrumb pageTitle="New Client" />
      <ComponentCard title="Create Client">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              {...register("clientName")}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
            {errors.clientName && (
              <p className="text-sm text-red-600">
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
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              {...register("address")}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              {...register("city")}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Postcode
            </label>
            <input
              {...register("postcode")}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register("status")}
              className="mt-1 block w-full rounded border px-3 py-2"
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
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Next Contact Date
            </label>
            <input
              type="date"
              {...register("nextContactDate")}
              className="mt-1 block w-full rounded border px-3 py-2"
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
              className="mt-1 block w-full rounded border px-3 py-2"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? "Creating..." : "Create Client"}
          </button>
        </form>
      </ComponentCard>
    </DashboardPlaceholderPageTemplate>
  );
}
