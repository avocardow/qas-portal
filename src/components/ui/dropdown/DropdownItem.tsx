import React from "react";
import Link from "next/link";

interface DropdownItemProps {
  tag?: "a" | "button";
  href?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  children: React.ReactNode;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  baseClassName = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  className = "",
  children,
  role,
  tabIndex,
  "aria-label": ariaLabel,
  onKeyDown,
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && href) {
    return (
      <Link 
        href={href} 
        className={combinedClasses} 
        onClick={handleClick}
        role={role}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
      >
        {children}
      </Link>
    );
  }

  return (
    <button 
      onClick={handleClick} 
      className={combinedClasses}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
};
