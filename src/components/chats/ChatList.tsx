import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import Image from "next/image";

interface ChatListProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatList({ isOpen, onToggle }: ChatListProps) {
  const [isOpenTwo, setIsOpenTwo] = useState(false);

  function toggleDropdownTwo() {
    setIsOpenTwo(!isOpenTwo);
  }

  function closeDropdownTwo() {
    setIsOpenTwo(false);
  }
  return (
    <div
      className={`no-scrollbar flex-col overflow-auto transition-all duration-300 ${
        isOpen
          ? "z-999999 fixed left-0 top-0 h-screen bg-white dark:bg-gray-900"
          : "hidden xl:flex"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-5 xl:hidden dark:border-gray-800">
        <div>
          <h3 className="text-theme-xl font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            Chat
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <div>
            <button className="dropdown-toggle" onClick={toggleDropdownTwo}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpenTwo}
              onClose={closeDropdownTwo}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdownTwo}
                className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdownTwo}
                className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
          <button
            onClick={onToggle}
            className="flex size-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition dark:border-gray-700 dark:text-gray-400 dark:hover:text-white/90"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex max-h-full flex-col overflow-auto px-4 sm:px-5">
        <div className="custom-scrollbar max-h-full space-y-1 overflow-auto">
          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-18.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Kaiya George
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Project Manager
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 15 mins </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-17.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Lindsey Curtis
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Designer
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 30 mins </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-19.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Zain Geidt
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Content Writer
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 45 mins </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-05.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-warning-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Carla George
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Front-end Developer
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 2 days </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-20.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Abram Schleifer
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Digital Marketer
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 1 hour </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-34.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Lincoln Donin
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Project ManagerProduct Designer
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 3 days </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-35.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Erin Geidthem
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Copyrighter
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 5 days </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-36.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-error-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Alena Baptista
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    SEO Expert
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 2 hours </span>
              </div>
            </div>
          </div>

          {/* <!-- Chat List Item --> */}
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]">
            <div className="relative h-12 w-full max-w-[48px] rounded-full">
              <Image
                width={48}
                height={48}
                src="/images/user/user-37.jpg"
                alt="profile"
                className="size-full overflow-hidden rounded-full object-cover object-center"
              />
              <span className="bg-success-500 absolute bottom-0 right-0 block size-3 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
            </div>
            <div className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Wilium vamos
                  </h5>
                  <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">
                    Content Writer
                  </p>
                </div>
                <span className="text-theme-xs text-gray-400"> 5 days </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
