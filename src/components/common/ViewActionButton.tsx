import React from "react";
import { EyeIcon } from "@/icons";

interface ViewActionButtonProps {
  onClick: () => void;
  className?: string;
}

const ViewActionButton: React.FC<ViewActionButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90 ${className}`}
      aria-label="View"
    >
      <EyeIcon />
    </button>
  );
};

export default ViewActionButton;
