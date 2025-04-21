import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EmailContent from "@/components/email/EmailInbox/EmailContent";
import EmailSidebar from "@/components/email/EmailSidebar/EmailSidebar";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Inbox | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Inbox page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Inbox() {
  return (
    <div className="">
      <PageBreadcrumb pageTitle="Inbox" />
      <div className="xl:h-[calc(100vh-186px) h-screen sm:h-[calc(100vh-174px)]">
        <div className="flex flex-col gap-5 sm:gap-5 xl:grid xl:grid-cols-12">
          <div className="col-span-full xl:col-span-3">
            <EmailSidebar />
          </div>
          <EmailContent />
        </div>
      </div>
    </div>
  );
}
