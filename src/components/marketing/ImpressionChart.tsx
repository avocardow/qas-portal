"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ImpressionChart() {
  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient", // Explicitly specify gradient type
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2], // Correct width as an array of numbers
    },
    markers: {
      size: 0,
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category", // Ensure proper type for categories
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false, // Correct usage for disabling tooltips
      },
    },
    yaxis: {
      title: {
        text: "", // Ensure no text is displayed
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: "Revenue",
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Impression & Data Traffic
          </h3>
          <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
            Jun 1, 2024 - Dec 1, 2025
          </p>
        </div>

        <div className="flex flex-row-reverse items-center justify-end gap-0.5 sm:flex-col sm:items-start">
          <div className="flex flex-row-reverse items-center gap-3 sm:flex-row sm:gap-2">
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              $9,758.00
            </h4>

            <span className="bg-success-50 text-theme-xs text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
              +7.96%
            </span>
          </div>

          <span className="text-theme-xs text-gray-500 dark:text-gray-400">
            Total Revenue
          </span>
        </div>
      </div>
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ml-4 min-w-[1000px] pl-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
