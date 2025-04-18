import React from "react";
import InvoiceSidebar from "./InvoiceSidebar";
import InvoiceMain from "./InvoiceMain";

export default function Invoice() {
  return (
    <div className="flex h-full flex-col gap-6 sm:gap-5 xl:flex-row">
      {/* <!-- Invoice Sidebar Start --> */}
      <InvoiceSidebar />
      {/* <!-- Invoice Sidebar End --> */}

      {/* <!-- Invoice Mainbox Start --> */}
      <InvoiceMain />
      {/* <!-- Invoice Mainbox End --> */}
    </div>
  );
}
