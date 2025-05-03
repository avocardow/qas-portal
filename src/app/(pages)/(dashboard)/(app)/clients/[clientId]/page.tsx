"use client";
import React, { Suspense, lazy, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { api } from "@/utils/api";
import { useAbility } from "@/hooks/useAbility";
import Authorized from '@/components/Authorized';
import { CLIENT_PERMISSIONS } from "@/constants/permissions";
import type { RouterOutput } from "@/utils/api";
import type { ClientDetailsSectionProps } from '@/components/clients/ClientDetailsSection';
import DocumentReferences from "@/components/common/DocumentReferences";
import { ActivityLogType } from "@prisma/client";
import QuickAddActivityForm from "@/components/clients/QuickAddActivityForm";
import ActivityLogTabs from "@/components/clients/ActivityLogTabs";
import AllFolders from '@/components/file-manager/AllFolders';
import RecentFileTable from '@/components/file-manager/RecentFileTable';
import RecentInvoicesCard from '@/components/invoice/RecentInvoicesCard';
import ClientAlertsSection from '@/components/clients/ClientAlertsSection';
import QuickActionButtons from '@/components/clients/QuickActionButtons';
import ClientNetworkDiagram, { NetworkNode, NetworkEdge } from '@/components/clients/ClientNetworkDiagram';

// Lazy load client sections for progressive loading
const ClientOverviewCard = lazy(() => import("@/components/clients/ClientOverviewCard"));
const ClientContactsSection = lazy(() => import("@/components/clients/ClientContactsSection"));
const ClientAssignedUserSection = lazy(() => import("@/components/clients/ClientAssignedUserSection"));
const ClientLicensesSection = lazy(() => import("@/components/clients/ClientLicensesSection"));
const ClientTrustAccountsSection = lazy(() => import("@/components/clients/ClientTrustAccountsSection"));
const AuditList = lazy(() => import("@/components/audit/AuditList"));

// Lazy load ClientDetailsSection with correct prop types
const ClientDetailsSection = lazy<React.ComponentType<ClientDetailsSectionProps>>(
  () => import("@/components/clients/ClientDetailsSection")
);

// Lazy load KPI and Manager cards
const ClientManagerCard = lazy(() => import("@/components/clients/ClientManagerCard"));
const LifetimeFeesCard = lazy(() => import("@/components/clients/LifetimeFeesCard"));
const YoYGrowthCard = lazy(() => import("@/components/clients/YoYGrowthCard"));
const HealthScoreCard = lazy(() => import("@/components/clients/HealthScoreCard"));

// Lazy load audit components
const AuditProgressBar = lazy(() => import("@/components/clients/AuditProgressBar"));
const AuditScheduleCard = lazy(() => import("@/components/clients/AuditScheduleCard"));

// Define client type including relations returned by getById tRPC output
type ClientWithRelations = RouterOutput['clients']['getById'];

export default function ClientDetailPage() {
  // Hooks must be called at top-level
  const params = useParams<{ clientId: string }>() ?? {};
  const clientId = params.clientId;
  const { can } = useAbility();
  const { data: clientData, isLoading, isError } = api.clients.getById.useQuery(
    { clientId },
    { refetchInterval: 5000, refetchOnWindowFocus: false, enabled: !!clientId }
  );
  const utils = api.useContext();
  const addLogMutation = api.clients.addActivityLog.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ clientId });
    },
  });
  const onAddActivity = async (type: ActivityLogType, content: string) => {
    await addLogMutation.mutateAsync({ clientId, type, content });
  };
  const { data: lifetimeData } = api.clients.getLifetimeData.useQuery(
    { clientId },
    { enabled: !!clientId }
  );
  const client = clientData as ClientWithRelations;
  const router = useRouter();

  // Prepare network diagram data with safe defaults before any early returns
   
  const diagramNodes = useMemo((): NetworkNode[] => {
    if (!clientData) return [];
    const contacts = clientData.contacts ?? [];
    const trustAccounts = clientData.trustAccounts ?? [];
    const nodes: NetworkNode[] = [
      { id: clientData.id, label: clientData.clientName, type: 'client' },
      ...contacts.map(c => ({ id: c.id, label: c.name ?? 'Unnamed Contact', type: 'contact' } as NetworkNode)),
      ...trustAccounts.map(t => ({ id: t.id, label: t.accountName ?? 'Unnamed Account', type: 'trustAccount' } as NetworkNode)),
    ];
    return nodes;
  }, [clientData]);
   
  const diagramEdges = useMemo((): NetworkEdge[] => {
    if (!clientData) return [];
    const contacts = clientData.contacts ?? [];
    const trustAccounts = clientData.trustAccounts ?? [];
    const edges: NetworkEdge[] = [
      ...contacts.map(c => ({ id: `edge-client-contact-${c.id}`, source: clientData.id, target: c.id } as NetworkEdge)),
      ...trustAccounts.map(t => ({ id: `edge-client-trust-${t.id}`, source: clientData.id, target: t.id } as NetworkEdge)),
    ];
    return edges;
  }, [clientData]);

  // Validate clientId param
  if (!clientId) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Invalid client ID.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  // Permission gating
  if (!can(CLIENT_PERMISSIONS.VIEW_STATUS)) {
    return <p>You are not authorized to view client details.</p>;
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardPlaceholderPageTemplate heading="Loading...">
        <p>Loading client...</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  // Error state
  if (isError || !client) {
    return (
      <DashboardPlaceholderPageTemplate heading="Error">
        <p>Error loading client details.</p>
      </DashboardPlaceholderPageTemplate>
    );
  }

  // Render client data
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <PageBreadcrumb pageTitle={client.clientName} />
      <Authorized action={CLIENT_PERMISSIONS.EDIT}>
        <QuickActionButtons clientId={client.id} />
      </Authorized>
      <Suspense fallback={null}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {client.assignedUser && (
            <ClientManagerCard manager={client.assignedUser} />
          )}
          <LifetimeFeesCard totalFees={lifetimeData?.totalFees ?? 0} feeHistory={lifetimeData?.feeHistory ?? []} />
          <YoYGrowthCard growthPercentage={0} growthHistory={[]} />
          <HealthScoreCard score={0} />
        </div>
      </Suspense>
      <Suspense fallback={null}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AuditProgressBar />
          <AuditScheduleCard />
        </div>
      </Suspense>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<ComponentCard title="Client Overview"><p>Loading overview...</p></ComponentCard>}>
            <ClientOverviewCard client={client} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Contacts"><p>Loading contacts...</p></ComponentCard>}>
            <ClientContactsSection contacts={client.contacts} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Licenses"><p>Loading licenses...</p></ComponentCard>}>
            <ClientLicensesSection licenses={client.licenses} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Trust Accounts"><p>Loading trust accounts...</p></ComponentCard>}>
            <ClientTrustAccountsSection trustAccounts={client.trustAccounts} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Network Diagram"><p>Loading diagram...</p></ComponentCard>}>
            <ComponentCard title="Network Diagram">
              <ClientNetworkDiagram
                nodes={diagramNodes}
                edges={diagramEdges}
                onNodeClick={(event, node) => {
                  if (node.data.type === 'contact') {
                    router.push(`/clients/${clientId}/contacts/${node.id}`);
                  } else if (node.data.type === 'trustAccount') {
                    router.push(`/clients/${clientId}/trustAccounts/${node.id}`);
                  }
                }}
              />
            </ComponentCard>
          </Suspense>
        </div>
        <div className="col-span-12 xl:col-span-8">
          {client.assignedUser && (
            <Suspense fallback={<ComponentCard title="Assigned User"><p>Loading assigned user...</p></ComponentCard>}>
              <ClientAssignedUserSection assignedUser={client.assignedUser} />
            </Suspense>
          )}
          <Suspense fallback={<ComponentCard title="Client Details"><p>Loading details...</p></ComponentCard>}>
            <ClientDetailsSection client={client} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Audits"><p>Loading audits...</p></ComponentCard>}>
            <AuditList clientId={client.id} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Activity Log"><p>Loading activity log...</p></ComponentCard>}>
            <ComponentCard title="Activity Log">
              <QuickAddActivityForm onAdd={onAddActivity} />
              {addLogMutation.status === 'pending' && <p className="text-theme-sm text-gray-500">Adding activity...</p>}
              <ActivityLogTabs logs={client.activityLogs ?? []} pageSize={5} />
            </ComponentCard>
          </Suspense>
          <Suspense fallback={<ComponentCard title="Documents"><p>Loading documents...</p></ComponentCard>}>
            <DocumentReferences documents={client.documents ?? []} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="Alerts & Warnings"><p>Loading alerts...</p></ComponentCard>}>
            <ClientAlertsSection documents={client.documents ?? []} licenses={client.licenses ?? []} />
          </Suspense>
          <Suspense fallback={<ComponentCard title="SharePoint Folders"><p>Loading folders...</p></ComponentCard>}>
            <ComponentCard title="SharePoint Folders">
              <AllFolders />
            </ComponentCard>
          </Suspense>
          <Suspense fallback={<ComponentCard title="Recent Files"><p>Loading files...</p></ComponentCard>}>
            <ComponentCard title="Recent Files">
              <RecentFileTable />
            </ComponentCard>
          </Suspense>
          <Suspense fallback={<ComponentCard title="Recent Invoices"><p>Loading invoices...</p></ComponentCard>}>
            <ComponentCard title="Recent Invoices">
              <RecentInvoicesCard clientId={client.id} />
            </ComponentCard>
          </Suspense>
        </div>
      </div>
    </div>
  );
}