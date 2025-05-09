import React from "react";
import DataTableOne from "@/components/tables/DataTables/TableOne/DataTableOne";

interface ContactRow {
  id?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  title?: string | null;
  // licenseNumber is optional since API may not supply it
  licenseNumber?: string | null;
}

interface ContactsTableProps {
  data: ContactRow[];
  onRowClick?: (row: ContactRow) => void;
  onDelete?: (row: ContactRow) => void;
}

export default function ContactsTable({ data, onRowClick, onDelete }: ContactsTableProps) {
  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "phone", header: "Phone", sortable: false },
    { key: "email", header: "Email", sortable: false },
    { key: "title", header: "Contact Type", sortable: false },
    { key: "licenseNumber", header: "License Number", sortable: false },
    { key: "actions", header: "Actions", sortable: false },
  ];
  // Include action buttons in each row
  const dataWithActions = data.map((row) => ({
    ...row,
    actions: onDelete ? (
      <button
        type="button"
        className="text-red-600 hover:underline"
        onClick={(e) => { e.stopPropagation(); onDelete(row); }}
      >
        Delete
      </button>
    ) : undefined,
  }));
  return (
    <DataTableOne
      data={dataWithActions}
      columns={columns}
      onRowClick={(row) => onRowClick?.(row)}
      caption="Contacts"
      showControls={false}
    />
  );
} 