import React from "react";
import DashboardPlaceholderPageTemplate from "@/components/common/DashboardPlaceholderPageTemplate";

interface ErrorFallbackProps {
  message?: string;
}

export default function ErrorFallback({ message }: ErrorFallbackProps) {
  return (
    <DashboardPlaceholderPageTemplate heading="Error">
      <p>{message || "Something went wrong."}</p>
    </DashboardPlaceholderPageTemplate>
  );
} 