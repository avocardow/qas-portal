import React from "react";

interface DashboardPlaceholderProps {
  heading: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const DashboardPlaceholderPageTemplate: React.FC<DashboardPlaceholderProps> = ({
  heading,
  message = "Coming Soon",
  children,
  className = "",
}) => (
  <div className={`placeholder-container ${className}`}>
    <h1 className="mb-4 text-2xl font-semibold">{heading}</h1>
    <p className="mb-6 text-gray-600">{message}</p>
    {children}
  </div>
);

export default DashboardPlaceholderPageTemplate;
