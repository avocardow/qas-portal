import React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";

interface AuditListProps {
  clientId: string;
}

const AuditList: React.FC<AuditListProps> = ({ clientId }) => {
  const router = useRouter();
  const {
    data: audits,
    isLoading,
    isError,
  } = api.audit.getByClientId.useQuery({ clientId });

  if (isLoading) return <p>Loading audits...</p>;
  if (isError || !audits) return <p>Error loading audits.</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Audits</h2>
        <Button onClick={() => router.push(`/audits/new?clientId=${clientId}`)}>
          Add New Audit Year
        </Button>
      </div>
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableCell isHeader>Year</TableCell>
            <TableCell isHeader>Stage</TableCell>
            <TableCell isHeader>Status</TableCell>
            <TableCell isHeader>Due Date</TableCell>
            <TableCell isHeader>Assigned Staff</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {audits.length ? (
            audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => router.push(`/audits/${audit.id}`)}
                  >
                    {audit.auditYear}
                  </button>
                </TableCell>
                <TableCell>
                  <select
                    defaultValue={audit.stage?.id ?? ""}
                    className="rounded border px-2 py-1"
                    onChange={(e) =>
                      console.log("Change stage to", e.target.value)
                    }
                  >
                    <option value="">--</option>
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    defaultValue={audit.status?.id ?? ""}
                    className="rounded border px-2 py-1"
                    onChange={(e) =>
                      console.log("Change status to", e.target.value)
                    }
                  >
                    <option value="">--</option>
                  </select>
                </TableCell>
                <TableCell>
                  {audit.reportDueDate
                    ? new Date(audit.reportDueDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>No audits found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditList;
