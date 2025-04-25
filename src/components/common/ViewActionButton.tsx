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
      className={`inline-flex items-center justify-center p-1 text-gray-500 hover:text-gray-800 sm:p-2 dark:text-gray-400 dark:hover:text-white/90 ${className}`}
      aria-label="View"
    >
      <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
};

export default ViewActionButton;
