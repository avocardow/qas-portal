"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";

type Position = "top" | "right" | "bottom" | "left";

interface PopoverProps {
  position: Position;
  trigger: React.ReactNode;
  children: ReactNode;
  triggerOnHover?: boolean;
}

export default function Popover({ position, trigger, children, triggerOnHover }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePopover = () => setIsOpen(!isOpen);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  const arrowClasses = {
    top: "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45",
    right:
      "left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45",
    bottom:
      "top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45",
    left: "right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-45",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={triggerOnHover ? () => setIsOpen(true) : undefined}
      onMouseLeave={triggerOnHover ? () => setIsOpen(false) : undefined}
    >
      <div ref={triggerRef} onClick={togglePopover}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className={`z-99999 absolute w-[300px] ${positionClasses[position]}`}
        >
          <div className="shadow-theme-lg w-full rounded-xl bg-white dark:bg-[#1E2634]">
            {children}
            <div
              className={`shadow-theme-lg absolute size-3 bg-white dark:bg-[#1E2634] ${arrowClasses[position]}`}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
