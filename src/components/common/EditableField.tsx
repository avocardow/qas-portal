import React, { useState, useRef, useEffect } from "react";
import { PencilIcon, CheckLineIcon, CloseLineIcon } from "@/icons";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
}

export default function EditableField({ label, value, onSave }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value when prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleSave = () => {
    if (currentValue !== value) {
      onSave(currentValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-medium">{label}:</span>
      {editing ? (
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-800"
            aria-label="Save"
          >
            <CheckLineIcon />
          </button>
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-800"
            aria-label="Cancel"
          >
            <CloseLineIcon />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Edit"
          >
            <PencilIcon />
          </button>
        </div>
      )}
    </div>
  );
} 