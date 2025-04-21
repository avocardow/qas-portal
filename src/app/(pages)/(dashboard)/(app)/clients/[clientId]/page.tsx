import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";

// Server component: accept params from Next.js
interface ClientDetailPageProps {
  params: { clientId: string };
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = params;
  return <DashboardPlaceholderPageTemplate heading={`Client ${clientId}`} />;
}
