import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function InvoiceTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Product
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Quantity
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Unit Cost
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            <TableRow>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                TailGrids
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                $48
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                TailGrids
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                $48
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                TailGrids
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                $48
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                TailGrids
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                1
              </TableCell>
              <TableCell className="text-theme-sm px-5 py-3.5 text-left text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                $48
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
