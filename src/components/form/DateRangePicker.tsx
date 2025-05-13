import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import rangePlugin from 'flatpickr/dist/plugins/rangePlugin';
import 'flatpickr/dist/flatpickr.css';

// DateOption can be ISO string or Date
type DateOption = string | Date;

interface DateRangePickerProps {
  /** Base id to use for start/end inputs */
  id: string;
  label?: string;
  /** Initial start date */
  startDate?: DateOption;
  /** Initial end date */
  endDate?: DateOption;
  /** Called when dates change: [start, end] strings (YYYY-MM-DD) */
  onChange?: (dates: [string, string]) => void;
  /** Optional min/max constraints */
  minDate?: DateOption;
  maxDate?: DateOption;
}

export default function DateRangePicker({
  id,
  label,
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startRef.current && endRef.current) {
      const fp = flatpickr(startRef.current, {
        mode: 'range',
        plugins: [rangePlugin({ input: endRef.current })],
        defaultDate: startDate && endDate ? [startDate, endDate] : undefined,
        minDate,
        maxDate,
        onChange: (selectedDates) => {
          const [s, e] = selectedDates;
          const fmt = (d?: Date) => d ? d.toISOString().split('T')[0] : '';
          onChange?.([fmt(s), fmt(e)]);
        },
      });
      return () => fp.destroy();
    }
  }, [startDate, endDate, minDate, maxDate, onChange]);

  return (
    <div>
      {label && <label htmlFor={`${id}-start`} className="block mb-1 font-medium">{label}</label>}
      <div className="flex space-x-2">
        <input
          id={`${id}-start`}
          ref={startRef}
          placeholder="Start Date"
          className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 focus:ring-3 focus:outline-none h-12 w-full rounded-lg border border-gray-300 px-4"
        />
        <input
          id={`${id}-end`}
          ref={endRef}
          placeholder="End Date"
          className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 focus:ring-3 focus:outline-none h-12 w-full rounded-lg border border-gray-300 px-4"
        />
      </div>
    </div>
  );
} 