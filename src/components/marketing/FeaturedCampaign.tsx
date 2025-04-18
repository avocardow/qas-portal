"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import Image from "next/image";

interface Campaign {
  id: number;
  creator: {
    image: string;
    name: string;
  };
  campaign: {
    image: string;
    name: string;
    type: string;
  };
  status: string;
}

const campaigns: Campaign[] = [
  {
    id: 1,
    creator: {
      image: "/images/user/user-01.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-01.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Success",
  },
  {
    id: 2,
    creator: {
      image: "/images/user/user-02.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-02.svg",
      name: "Make Better Ideas...",
      type: "Ads campaign",
    },
    status: "Pending",
  },
  {
    id: 3,
    creator: {
      image: "/images/user/user-03.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-03.svg",
      name: "Increase your website tra...",
      type: "Ads campaign",
    },
    status: "Success",
  },
  {
    id: 4,
    creator: {
      image: "/images/user/user-04.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-04.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Failed",
  },
  {
    id: 5,
    creator: {
      image: "/images/user/user-05.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-05.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Success",
  },
  {
    id: 6,
    creator: {
      image: "/images/user/user-06.jpg",
      name: "Wilson Gouse",
    },
    campaign: {
      image: "/images/brand/brand-06.svg",
      name: "Grow your brand by...",
      type: "Ads campaign",
    },
    status: "Success",
  },
];

export default function FeaturedCampaign() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pb-3 pt-4 sm:px-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex justify-between gap-2 sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Featured Campaigns
          </h3>
        </div>

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
        <div className="min-w-full">
          <Table>
            <TableHeader className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Products
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Campaign
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {campaigns.map((item) => (
                <TableRow key={item.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-[18px]">
                      <div className="size-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={item.creator.image}
                          alt="user"
                        />
                      </div>
                      <div>
                        <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                          {item.creator.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex w-full items-center gap-5">
                      <div className="w-full max-w-8">
                        <Image
                          width={40}
                          height={40}
                          src={item.campaign.image}
                          alt="brand"
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-theme-sm mb-0.5 truncate font-medium text-gray-700 dark:text-gray-400">
                          {item.campaign.name}
                        </p>
                        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                          {item.campaign.type}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        item.status === "Success"
                          ? "success"
                          : item.status === "Pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
