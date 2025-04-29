import React from 'react';
import { rbacPolicy, type Role } from "@/utils/rbacPolicy";
import { useRbac } from '@/context/RbacContext';

const ViewAsDropdown: React.FC = () => {
  const { impersonatedRole, setImpersonatedRole } = useRbac();
  // list all roles except Developer
  const roles = Object.keys(rbacPolicy).filter((r) => r !== "Developer") as Role[];

  return (
    <select
      value={impersonatedRole ?? ""}
      onChange={(e) =>
        setImpersonatedRole(e.target.value ? (e.target.value as Role) : null)
      }
      className="rounded border px-2 py-1 text-sm"
    >
      <option value="">Developer view</option>
      {roles.map((r) => (
        <option key={r} value={r}>
          View as {r}
        </option>
      ))}
    </select>
  );
};

export default ViewAsDropdown;