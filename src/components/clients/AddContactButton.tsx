import React from "react";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";

interface AddContactButtonProps {
  onClick: () => void;
  className?: string;
}

export default function AddContactButton({ onClick, className = "" }: AddContactButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={className}
      startIcon={<PlusIcon className="h-4 w-4" />}
    >
      Add Contact
    </Button>
  );
} 