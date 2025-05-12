"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import { api } from '@/utils/api';
import { ActivityLogType } from '@prisma/client';
import { useAbility } from '@/hooks/useAbility';
import { ACTIVITY_PERMISSIONS } from '@/constants/permissions';

export interface ActivityLogEntry {
  id: string;
  type: string;
  content: string;
  createdAt: string | Date;
  createdBy?: string | null;
  modifiedBy?: string | null;
  creator?: { name?: string | null } | null;
  modifier?: { name?: string | null } | null;
  contactId?: string;
}

interface ActivityLogTimelineProps {
  entries: ActivityLogEntry[];
  contacts: { id: string; name?: string | null }[];
  clientId: string;
}

// Icon mapping based on activity type
function getActivityIcon(type: string, content?: string) {
  const base = "text-xl text-gray-500 dark:text-gray-400 flex items-center justify-center";
  // Use slash icon for unassign logs
  if (type === 'note' && content?.startsWith('Unassigned ')) {
    return <i className={`fa-solid fa-user-slash ${base}`} />;
  }
  switch (type) {
    case 'stage_change': return <i className={`fa-solid fa-arrow-progress ${base}`} />;
    case 'status_change': return <i className={`fa-solid fa-stairs ${base}`} />;
    case 'client_assigned': return <i className={`fa-solid fa-handshake-angle ${base}`} />;
    case 'audit_assigned': return <i className={`fa-solid fa-list-check ${base}`} />;
    case 'note': return <i className={`fa-solid fa-note-sticky ${base}`} />;
    case 'email_sent': return <i className={`fa-solid fa-inbox-out ${base}`} />;
    case 'email_received': return <i className={`fa-solid fa-inbox-in ${base}`} />;
    case 'call_in': return <i className={`fa-solid fa-phone-arrow-down-left ${base}`} />;
    case 'call_out': return <i className={`fa-solid fa-phone-arrow-up-right ${base}`} />;
    case 'document_request': return <i className={`fa-solid fa-file-circle-question ${base}`} />;
    case 'document_received': return <i className={`fa-solid fa-file-import ${base}`} />;
    case 'document_signed': return <i className={`fa-solid fa-file-signature ${base}`} />;
    case 'meeting_summary': return <i className={`fa-solid fa-comments ${base}`} />;
    case 'billing_commentary': return <i className={`fa-solid fa-comment-dollar ${base}`} />;
    case 'external_folder_instructions': return <i className={`fa-solid fa-folder-tree ${base}`} />;
    case 'software_access_instructions': return <i className={`fa-solid fa-memo-circle-info ${base}`} />;
    default: return <i className={`fas fa-user ${base}`} />;
  }
}

export default function ActivityLogTimeline({ entries, contacts, clientId }: ActivityLogTimelineProps) {
  const { can } = useAbility();
  // Filter entries by permission; parent component handles overall sorting and pagination order
  const visibleEntries = entries.filter((entry) => {
    if (entry.type === 'billing_commentary' && !can(ACTIVITY_PERMISSIONS.ADD_BILLING_COMMENTARY)) return false;
    if (entry.type === 'external_folder_instructions' && !can(ACTIVITY_PERMISSIONS.ADD_EXTERNAL_FOLDER_INSTRUCTIONS)) return false;
    if (entry.type === 'software_access_instructions' && !can(ACTIVITY_PERMISSIONS.ADD_SOFTWARE_ACCESS_INSTRUCTIONS)) return false;
    return true;
  });
  const [editingEntry, setEditingEntry] = useState<ActivityLogEntry | null>(null);
  // Form state for editing
  const [editType, setEditType] = useState<string>('note');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editContactId, setEditContactId] = useState<string | undefined>(undefined);
  const [editError, setEditError] = useState<string | null>(null);
  // Stub TRPC context in test environment
  const utils = process.env.NODE_ENV === 'test'
    ? { clients: { getById: { invalidate: async () => {} } } }
    : api.useContext();
  const updateActivityMutation = process.env.NODE_ENV === 'test'
    ? { mutateAsync: async () => {} }
    : api.clients.updateActivityLog.useMutation({
    onSuccess: () => {
      setEditingEntry(null);
      setEditError(null);
      // Invalidate/refetch activity logs (assuming clients.getById is used for parent data)
      void utils.clients.getById.invalidate();
    },
    onError: (err) => {
      setEditError(err instanceof Error ? err.message : 'Failed to update activity');
    },
  });

  // Prefill form when opening edit modal
  useEffect(() => {
    if (editingEntry) {
      setEditType(editingEntry.type);
      setEditDescription(editingEntry.content);
      setEditContactId(editingEntry.contactId ?? undefined);
    }
  }, [editingEntry]);

  // Static type options (can adjust by permissions as needed)
  const typeOptions = [
    { value: 'note', label: 'Note' },
    { value: 'email_sent', label: 'Email Sent' },
    { value: 'email_received', label: 'Email Received' },
    { value: 'call_in', label: 'Call In' },
    { value: 'call_out', label: 'Call Out' },
    { value: 'document_request', label: 'Document Request' },
    { value: 'document_received', label: 'Document Received' },
    { value: 'document_signed', label: 'Document Signed' },
    { value: 'meeting_summary', label: 'Meeting Summary' },
    { value: 'billing_commentary', label: 'Billing Commentary' },
    { value: 'external_folder_instructions', label: 'External Folder Instructions' },
    { value: 'software_access_instructions', label: 'Software Access Instructions' },
  ];

  if (!visibleEntries || visibleEntries.length === 0) {
    return <p className="text-gray-500">No activity logs</p>;
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute top-4 bottom-0 left-9 w-px bg-gray-200 dark:bg-gray-800" />

      {visibleEntries.map((entry) => (
        <div key={entry.id} className="relative rounded-xl px-3 py-2 mb-6 flex cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]" onClick={() => setEditingEntry(entry)}>
          <div className="z-10 shrink-0 content-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {getActivityIcon(entry.type, entry.content)}
            </div>
          </div>
          <div className="ml-4 flex flex-col justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
                new Date(entry.createdAt)
              )}
            </span>
            <p className="text-base text-gray-900 dark:text-white/90 mt-1">
              {entry.content.length > 140
                ? `${entry.content.substring(0, 140)}...`
                : entry.content}
            </p>
            {entry.modifiedBy ? (
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                Edited: {entry.modifier?.name || entry.modifiedBy}
              </p>
            ) : entry.createdBy ? (
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                {entry.creator?.name || entry.createdBy}
              </p>
            ) : null}
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editingEntry && (
        <Modal
          isOpen
          onClose={() => setEditingEntry(null)}
          overlayClassName="bg-black/90"
          className="max-w-md max-h-[90vh] overflow-y-auto p-6"
        >
          <ComponentCard title="Edit Activity Item">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingEntry) return;
                setEditError(null);
                await updateActivityMutation.mutateAsync({
                  id: editingEntry.id,
                  clientId,
                  type: editType as ActivityLogType,
                  content: editDescription,
                });
              }}
              className="space-y-4"
            >
              {editError && (
                <div className="text-red-600 text-sm mb-2">{editError}</div>
              )}
              <div>
                <Label htmlFor="contactId">Contact</Label>
                <Select
                  options={contacts.map(c => ({ value: c.id, label: c.name ?? c.id }))}
                  defaultValue={editContactId ?? ''}
                  onChange={val => setEditContactId(val || undefined)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  options={typeOptions}
                  defaultValue={editType}
                  onChange={val => setEditType(val)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  placeholder="Description"
                  rows={6}
                  value={editDescription}
                  onChange={val => setEditDescription(val)}
                  className="mt-1 min-h-[120px]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setEditingEntry(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </ComponentCard>
        </Modal>
      )}
    </div>
  );
} 