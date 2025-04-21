"use client";
import React from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";

export default function ClientsPage() {
  const { data: clients, isLoading, error } = api.client.getAll.useQuery();

  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate
        heading="Clients"
        message="Loading..."
      />
    );
  }

  if (error) {
    return (
      <DashboardPlaceholderPageTemplate
        heading="Clients"
        message="Error loading clients."
      />
    );
  }

  return (
    <DashboardPlaceholderPageTemplate heading="Clients" message="">
      {/* Table of clients */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {client.id}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-blue-600">
                  <Link href={`/clients/${client.id}`}>
                    {client.clientName}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {client.city ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {client.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPlaceholderPageTemplate>
  );
}
