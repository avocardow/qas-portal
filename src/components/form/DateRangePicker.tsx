import React from 'react';
import DatePicker from './date-picker';

// DateOption can be a string (ISO) or a Date object
type DateOption = string | Date;

interface DateRangePickerProps {
  id: string;
  label?: string;
  placeholder?: string;
  /** Array of two dates: [startDate, endDate] */
  defaultDates?: [DateOption, DateOption];
  /** Callback receives [startDateString, endDateString] */
  onChange?: (dates: [string, string]) => void;
  /** Optional min/max constraints */
  minDate?: DateOption;
  maxDate?: DateOption;
}

export default function DateRangePicker({
  id,
  label,
  placeholder,
  defaultDates,
  onChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const handleChange = (selectedDates: Date[]) => {
    const [start, end] = selectedDates;
    const formatDate = (date?: Date): string =>
      date ? date.toISOString().split('T')[0] : '';
    onChange?.([formatDate(start), formatDate(end)]);
  };

  return (
    <DatePicker
      id={id}
      label={label}
      mode="range"
      placeholder={placeholder}
      defaultDate={defaultDates}
      onChange={handleChange}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
} 