"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import Notification from '@/components/ui/notification/Notification';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import DatePicker from '@/components/form/date-picker';
import { useAbility } from '@/hooks/useAbility';
import { ACTIVITY_PERMISSIONS } from '@/constants/permissions';

export interface AddActivityModalProps {
  /** ID of the client to fetch contacts for */
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; description: string; date: string; contactId: string | null }) => void;
  contacts: { id: string; name?: string | null }[];
  serverError?: string | null;
}

export default function AddActivityModal({ isOpen, onClose, onSubmit, contacts, serverError }: AddActivityModalProps) {
  const { can } = useAbility();
  const [type, setType] = useState('note');
  const [description, setDescription] = useState('');
  const [dateValue, setDateValue] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | undefined>(undefined);

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
  ];

  if (can(ACTIVITY_PERMISSIONS.ADD_BILLING_COMMENTARY)) {
    typeOptions.push({ value: 'billing_commentary', label: 'Billing Commentary' });
  }

  if (can(ACTIVITY_PERMISSIONS.ADD_EXTERNAL_FOLDER_INSTRUCTIONS)) {
    typeOptions.push({ value: 'external_folder_instructions', label: 'External Folder Instructions' });
  }

  if (can(ACTIVITY_PERMISSIONS.ADD_SOFTWARE_ACCESS_INSTRUCTIONS)) {
    typeOptions.push({ value: 'software_access_instructions', label: 'Software Access Instructions' });
  }

  useEffect(() => {
    if (isOpen) {
      setType('note');
      setDescription('');
      setDateValue(new Date());
      setContactId(undefined);
      setErrorMessage(null);
    }
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description) {
      setErrorMessage('Description is required');
      return;
    }
    onSubmit({ type, description, date: dateValue.toISOString(), contactId: contactId ?? null });
  }

  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} overlayClassName="bg-black/90" className="max-w-md max-h-[90vh] overflow-y-auto p-6">
      <ComponentCard title="Add Activity Item">
        {serverError && <Notification variant="error" title={serverError} />}
        {errorMessage && <Notification variant="error" title={errorMessage} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time */}
          <div>
            <DatePicker
              id="activityDate"
              label="Date & Time"
              defaultDate={dateValue}
              onChange={(dates) => {
                const d = Array.isArray(dates) ? dates[0] : dates;
                if (d) setDateValue(d);
              }}
              placeholder="Select date"
              enableTime
              maxDate={new Date()}
            />
          </div>
          {/* Activity Type */}
          <div>
            <Label htmlFor="type">Activity Type</Label>
            <Select
              options={typeOptions}
              defaultValue={type}
              onChange={val => setType(val)}
              className="mt-1"
            />
          </div>
          {/* Related Contact */}
          <div className="pt-2 pb-1 font-semibold text-gray-700">Related Contact</div>
          <div>
            <Label htmlFor="contactId">Related Contact</Label>
            <Select
              options={contacts.map(c => ({ value: c.id, label: c.name ?? c.id }))}
              placeholder="Select contact"
              defaultValue={contactId ?? ''}
              onChange={val => setContactId(val || undefined)}
              className="mt-1"
            />
          </div>
          {/* Note Content */}
          <div className="pt-2 pb-1 font-semibold text-gray-700">Note Content</div>
          <div>
            <Label htmlFor="description">Note Content</Label>
            <TextArea
              placeholder="Description"
              rows={3}
              value={description}
              onChange={val => setDescription(val)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Activity</Button>
          </div>
        </form>
      </ComponentCard>
    </Modal>
  );
} 