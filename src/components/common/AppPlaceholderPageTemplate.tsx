import React from "react";
import ProtectedAppLayout from "@/app/(pages)/(app)/layout";

interface AppPlaceholderProps {
  heading: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const AppPlaceholderPageTemplate: React.FC<AppPlaceholderProps> = ({
  heading,
  message = "Coming Soon",
  children,
  className = "",
}) => (
  <ProtectedAppLayout>
    <div className={`placeholder-container ${className}`}>
      <h1 className="mb-4 text-2xl font-semibold">{heading}</h1>
      <p className="mb-6 text-gray-600">{message}</p>
      {children}
    </div>
  </ProtectedAppLayout>
);

export default AppPlaceholderPageTemplate;
