"use client";
import React, { useState } from "react";
import Checkbox from "../form/input/Checkbox";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

export default function UpcomingSchedule() {
  // Define the state with an index signature for dynamic string keys
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    "wed-11-jan": false,
    "fri-15-feb": false,
    "thu-18-mar": false,
  });

  const handleCheckboxChange = (id: string) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the checkbox state
    }));
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upcoming Schedule
        </h3>

        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-[500px] xl:min-w-full">
          <div className="flex flex-col gap-2">
            {/* Item 1 */}
            <div className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div>
                  <Checkbox
                    className="size-5 rounded-md"
                    checked={checkedItems["wed-11-jan"]}
                    onChange={() => handleCheckboxChange("wed-11-jan")}
                  />
                </div>
                <div>
                  <span className="text-theme-xs mb-0.5 block text-gray-500 dark:text-gray-400">
                    Wed, 11 Jan
                  </span>
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                    09:20 AM
                  </span>
                </div>
              </div>
              <div>
                <span className="text-theme-sm mb-1 block font-medium text-gray-700 dark:text-gray-400">
                  Business Analytics Press
                </span>
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Exploring the Future of Data-Driven +6 more
                </span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div>
                  <Checkbox
                    className="size-5 rounded-md"
                    checked={checkedItems["fri-15-feb"]}
                    onChange={() => handleCheckboxChange("fri-15-feb")}
                  />
                </div>
                <div>
                  <span className="text-theme-xs mb-0.5 block text-gray-500 dark:text-gray-400">
                    Fri, 15 Feb
                  </span>
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                    10:35 AM
                  </span>
                </div>
              </div>
              <div>
                <span className="text-theme-sm mb-1 block font-medium text-gray-700 dark:text-gray-400">
                  Business Sprint
                </span>
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Techniques from Business Sprint +2 more
                </span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div>
                  <Checkbox
                    className="size-5 rounded-md"
                    checked={checkedItems["thu-18-mar"]}
                    onChange={() => handleCheckboxChange("thu-18-mar")}
                  />
                </div>
                <div>
                  <span className="text-theme-xs mb-0.5 block text-gray-500 dark:text-gray-400">
                    Thu, 18 Mar
                  </span>
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                    1:15 AM
                  </span>
                </div>
              </div>
              <div>
                <span className="text-theme-sm mb-1 block font-medium text-gray-700 dark:text-gray-400">
                  Customer Review Meeting
                </span>
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Insights from the Customer Review Meeting +8 more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
