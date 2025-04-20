import React from "react";

interface PortalPlaceholderProps {
  heading: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const PortalPlaceholderPageTemplate: React.FC<PortalPlaceholderProps> = ({
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

export default PortalPlaceholderPageTemplate;
