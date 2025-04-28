"use client";
import React, { useState } from 'react';
import { api } from '@/utils/api';
import Authorized from '@/components/Authorized';
import { ROLE_PERMISSION_PERMISSIONS } from '@/constants/permissions';
import Button from '@/components/ui/button/Button';
import Notification from '@/components/ui/notification/Notification';
import type { RolePermission as PrismaRolePermission, Role, Permission as PrismaPermission } from '@prisma/client';

// Define mapping type including related nested data
type RolePermissionMapping = PrismaRolePermission & { role: Role; permission: PrismaPermission };

// Client-side component for managing role-permission mappings
export default function PermissionManagementClient() {
  // Selection state for assignment
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | ''>('');

  // API queries and mutations
  const rolesQuery = api.rolePermission.getRoles.useQuery();
  const permissionsQuery = api.rolePermission.getPermissions.useQuery();
  const mappingsQuery = api.rolePermission.getAll.useQuery(undefined, { refetchInterval: 5000 });
  const assignMutation = api.rolePermission.assign.useMutation();
  const unassignMutation = api.rolePermission.unassign.useMutation();

  // Notification state
  const [notification, setNotification] = useState<{
    variant: 'success' | 'error';
    title: string;
    description?: string;
  } | null>(null);

  // Handle assignment of permission to role
  const handleAssign = async () => {
    if (!selectedRoleId || !selectedPermissionId) {
      setNotification({ variant: 'error', title: 'Please select both role and permission.' });
      return;
    }
    try {
      await assignMutation.mutateAsync({ roleId: selectedRoleId, permissionId: selectedPermissionId });
      setNotification({ variant: 'success', title: 'Permission assigned successfully.' });
      mappingsQuery.refetch();
    } catch (error: unknown) {
      const title = error instanceof Error ? error.message : String(error);
      setNotification({ variant: 'error', title: title || 'Error assigning permission.' });
    }
  };

  // Handle removal of an existing mapping
  const handleRemove = async (roleId: number, permissionId: number) => {
    // Confirm before removing mapping
    if (!confirm('Are you sure you want to remove this permission from the selected role?')) {
      return;
    }
    try {
      await unassignMutation.mutateAsync({ roleId, permissionId });
      setNotification({ variant: 'success', title: 'Permission mapping removed.' });
      mappingsQuery.refetch();
    } catch (error: unknown) {
      const title = error instanceof Error ? error.message : String(error);
      setNotification({ variant: 'error', title: title || 'Error removing permission.' });
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          variant={notification.variant}
          title={notification.title}
          description={notification.description}
        />
      )}
      {/* Assignment Form */}
      <Authorized action={ROLE_PERMISSION_PERMISSIONS.ASSIGN} fallback={null}>
        <div className="flex items-center gap-4">
          {/* Roles dropdown */}
          <select
            className="rounded border px-3 py-2"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(Number(e.target.value) || '')}
          >
            <option value="">Select Role</option>
            {rolesQuery.data?.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {/* Permissions dropdown */}
          <select
            className="rounded border px-3 py-2"
            value={selectedPermissionId}
            onChange={(e) => setSelectedPermissionId(Number(e.target.value) || '')}
          >
            <option value="">Select Permission</option>
            {permissionsQuery.data?.map((perm) => (
              <option key={perm.id} value={perm.id}>{perm.action}</option>
            ))}
          </select>
          <Button
            onClick={handleAssign}
            disabled={assignMutation.status === 'pending'}
          >
            Assign Permission
          </Button>
        </div>
      </Authorized>

      {/* Mappings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Permission</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mappingsQuery.data?.map((m: RolePermissionMapping) => (
              <tr key={`${m.roleId}-${m.permissionId}`}> 
                <td className="px-4 py-2">{m.role.name}</td>
                <td className="px-4 py-2">{m.permission.action}</td>
                <td className="px-4 py-2">
                  <Authorized action={ROLE_PERMISSION_PERMISSIONS.UNASSIGN} fallback={null}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(m.roleId, m.permissionId)}
                      disabled={unassignMutation.status === 'pending'}
                    >
                      Remove
                    </Button>
                  </Authorized>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 