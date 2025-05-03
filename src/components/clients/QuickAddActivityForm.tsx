"use client";
import React, { useState } from 'react';
import { ActivityLogType } from '@prisma/client';

interface QuickAddActivityFormProps {
  onAdd: (type: ActivityLogType, content: string) => Promise<void>;
}

export default function QuickAddActivityForm({ onAdd }: QuickAddActivityFormProps) {
  const [type, setType] = useState<ActivityLogType>(ActivityLogType.note);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(type, content.trim());
      setContent('');
    } catch (error) {
      console.error('Error adding activity log:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ActivityLogType)}
        className="rounded border px-2 py-1"
      >
        {Object.values(ActivityLogType).map((t) => (
          <option key={t} value={t}>
            {t.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter activity..."
        className="flex-1 rounded border px-2 py-1"
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
} 