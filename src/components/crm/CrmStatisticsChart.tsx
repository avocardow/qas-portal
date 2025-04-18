"use client";
import React from "react";
import ChartTab from "../common/ChartTab";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CrmStatisticsChart() {
  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 220,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 220,
          },
        },
      },
      {
        breakpoint: 1600,
        options: {
          chart: {
            height: 220,
          },
        },
      },
      {
        breakpoint: 2600,
        options: {
          chart: {
            height: 250,
          },
        },
      },
    ],
    stroke: {
      curve: "straight",
      width: [2, 2],
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
      type: "category",
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
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: undefined, // Removed the `fontSize: "0px"` workaround.
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
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
            Target you’ve set for each month
          </p>
        </div>
        <ChartTab />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-9">
        <div className="flex items-start gap-2">
          <div>
            <h4 className="sm:text-theme-xl text-base font-bold text-gray-800 dark:text-white/90">
              $212,142.12
            </h4>
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              Avg. Yearly Profit
            </span>
          </div>
          <span className="bg-success-50 text-theme-xs text-success-600 dark:bg-success-500/15 dark:text-success-500 mt-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
            +23.2%
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div>
            <h4 className="sm:text-theme-xl text-base font-bold text-gray-800 dark:text-white/90">
              $30,321.23
            </h4>
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              Avg. Yearly Profit
            </span>
          </div>
          <span className="bg-error-50 text-theme-xs text-error-600 dark:bg-error-500/15 dark:text-error-500 mt-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
            -12.3%
          </span>
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ml-4 min-w-[650px] pl-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={220}
          />
        </div>
      </div>
    </div>
  );
}
