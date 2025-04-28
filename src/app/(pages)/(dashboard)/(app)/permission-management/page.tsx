import type { Metadata } from "next";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PermissionManagementClient from './PermissionManagementClient';

export const metadata: Metadata = {
  title: "Permission Management | TailAdmin - Admin",
  description: "Admin UI for managing role-permission mappings.",
};

export default function PermissionManagementPage() {
  return (
    <DashboardPlaceholderPageTemplate heading="Permission Management">
      <PermissionManagementClient />
    </DashboardPlaceholderPageTemplate>
  );
}