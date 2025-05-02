// Removed placeholder stub and DashboardPlaceholderPageTemplate

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClientOverviewCard from '@/components/clients/ClientOverviewCard';
import ClientDetailsSection from '@/components/clients/ClientDetailsSection';

export default function ClientDetailPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <PageBreadcrumb pageTitle="Client Profile" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-4">
          <ClientOverviewCard />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <ClientDetailsSection />
        </div>
      </div>
    </div>
  );
}