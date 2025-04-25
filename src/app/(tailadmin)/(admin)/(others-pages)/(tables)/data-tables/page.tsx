"use client"; // Mark template page as client component

import React from "react";
import DataTableOne from "@/components/tables/DataTables/TableOne/DataTableOne";
import DataTableTwo from "@/components/tables/DataTables/TableTwo/DataTableTwo";
import DataTableThree from "@/components/tables/DataTables/TableThree/DataTableThree";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

const Tables = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Data Tables" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Data Table 1">
          <DataTableOne />
        </ComponentCard>
        <ComponentCard title="Data Table 2">
          <DataTableTwo searchTerm="" setSearchTerm={() => {}} />
        </ComponentCard>
        <ComponentCard title="Data Table 3">
          <DataTableThree />
        </ComponentCard>
      </div>
    </div>
  );
};

export default Tables;
