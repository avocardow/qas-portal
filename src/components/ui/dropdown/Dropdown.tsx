"use client";
import React, { useEffect, useRef } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  role,
  "aria-label": ariaLabel,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`shadow-theme-lg dark:bg-gray-dark absolute right-0 z-40 mt-2 rounded-xl border border-gray-200 bg-white dark:border-gray-800 ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
