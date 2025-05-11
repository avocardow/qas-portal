import React from "react";
import { PlusIcon } from "@/icons";

interface AddContactButtonProps {
  onClick: () => void;
  className?: string;
}

export default function AddContactButton({ onClick, className = "" }: AddContactButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 text-gray-500 opacity-75 hover:text-gray-600 hover:opacity-100 ${className}`}
      aria-label="Add Contact"
    >
      <PlusIcon className="h-5 w-5" />
    </button>
  );
} 