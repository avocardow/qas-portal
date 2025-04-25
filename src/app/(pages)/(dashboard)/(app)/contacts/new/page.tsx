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
import { useRbac } from "@/context/RbacContext";

// Define form schema matching contact fields
const formSchema = z.object({
  clientId: z.string().uuid("Client is required"),
  name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  isPrimary: z.boolean().optional(),
  canLoginToPortal: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewContactPage() {
  // Hooks must run unconditionally
  const { role } = useRbac();
  const { data: clientsList } = api.clients.getAll.useQuery({ pageSize: 1000 });
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const createContactMutation = api.contact.create.useMutation();
  const onSubmit = (data: FormData) => {
    // Submit contact create mutation
    createContactMutation.mutate(data, {
      onSuccess: (created) => router.push(`/contacts/${created.id}`),
      onError: (err) => console.error(err),
    });
  };
  // Guard after hooks
  if (role !== "Admin") {
    return <p>You are not authorized to create contacts.</p>;
  }
  return (
    <DashboardPlaceholderPageTemplate heading="New Contact">
      <PageBreadcrumb pageTitle="New Contact" />
      <ComponentCard title="Create Contact">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client
            </label>
            <select
              {...register("clientId")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
            >
              <option value="">Select a client</option>
              {clientsList?.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-sm text-red-600">{errors.clientId.message}</p>
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
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              {...register("phone")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              {...register("title")}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" {...register("isPrimary")} />
            <label>Primary Contact</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" {...register("canLoginToPortal")} />
            <label>Can Login To Portal</label>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? "Creating..." : "Create Contact"}
          </button>
        </form>
      </ComponentCard>
    </DashboardPlaceholderPageTemplate>
  );
}
