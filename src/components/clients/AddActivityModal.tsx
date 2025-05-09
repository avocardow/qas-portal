"use client";

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

export interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; description: string; date: string }) => void;
}

export default function AddActivityModal({ isOpen, onClose, onSubmit }: AddActivityModalProps) {
  const [type, setType] = useState('note');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ type, description, date });
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black opacity-30" />
        <span className="inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all align-middle max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            New Activity Item
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-theme focus:border-theme sm:text-sm"
              >
                <option value="note">Note</option>
                <option value="email_sent">Email Sent</option>
                <option value="email_received">Email Received</option>
                <option value="call_in">Call In</option>
                <option value="call_out">Call Out</option>
                <option value="status_change">Status Change</option>
                <option value="stage_change">Stage Change</option>
                <option value="document_request">Document Request</option>
                <option value="document_received">Document Received</option>
                <option value="document_signed">Document Signed</option>
                <option value="task_created">Task Created</option>
                <option value="task_completed">Task Completed</option>
                <option value="meeting_summary">Meeting Summary</option>
                <option value="billing_commentary">Billing Commentary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-theme focus:border-theme sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-theme focus:border-theme sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-theme text-white rounded-md hover:bg-theme-dark"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 