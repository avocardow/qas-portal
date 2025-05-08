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
}

export default function ContactsTable({ data, onRowClick }: ContactsTableProps) {
  const columns = [
    { key: "name", header: "Name", sortable: true },
    { key: "phone", header: "Phone", sortable: false },
    { key: "email", header: "Email", sortable: false },
    { key: "title", header: "Contact Type", sortable: false },
    { key: "licenseNumber", header: "License Number", sortable: false },
  ];
  return (
    <DataTableOne
      data={data}
      columns={columns}
      onRowClick={(row) => onRowClick?.(row)}
      caption="Contacts"
    />
  );
} 