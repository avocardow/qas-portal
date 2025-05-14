"use client";

import React from "react";
import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption | DateOption[];
  label?: string;
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: DateOption;
  /** Maximum selectable date */
  maxDate?: DateOption;
  /** Show time select (24hr). Defaults to false. */
  enableTime?: boolean;
  /** Close the calendar after selecting a date. Defaults to false. */
  closeOnSelect?: boolean;
  /** Controlled value for the input (ISO or display string) */
  value?: string;
  /** Show a clear button in the calendar popup */
  showClearButton?: boolean;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  minDate,
  maxDate,
  enableTime = false,
  closeOnSelect = false,
  value,
  showClearButton = false,
}: PropsType) {
  const fpRef = useRef<ReturnType<typeof flatpickr> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const flatPickrInstance = flatpickr(`#${id}`, {
      mode: mode || "single",
      monthSelectorType: "static",
      enableTime,
      ...(enableTime ? { time_24hr: false, minuteIncrement: 1 } : {}),
      dateFormat: enableTime ? "d/m/Y H:i" : "d/m/Y",
      defaultDate,
      minDate,
      maxDate,
      closeOnSelect,
      ...(onChange ? { onChange } : {}),
    });

    fpRef.current = flatPickrInstance;
    return () => {
      if (fpRef.current && !Array.isArray(fpRef.current)) {
        fpRef.current.destroy();
        fpRef.current = null;
      }
    };
  }, [mode, onChange, id, defaultDate, minDate, maxDate, enableTime, closeOnSelect]);

  // Update the flatpickr date when defaultDate changes (e.g., opening form)
  useEffect(() => {
    if (fpRef.current && defaultDate) {
      const dates: DateOption[] = Array.isArray(defaultDate) ? defaultDate as DateOption[] : [defaultDate as DateOption];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fpRef.current as any).setDate(dates, false);
    }
  }, [defaultDate]);

  // Sync input value with controlled value
  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          placeholder={placeholder}
          className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 focus:ring-3 focus:outline-hidden h-12 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-base text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
        {(showClearButton && ((value && value.length > 0) || (inputRef.current && inputRef.current.value.length > 0))) && (
          <button
            type="button"
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              // Clear the input and calendar
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              if (fpRef.current) {
                let instance = fpRef.current;
                if (Array.isArray(instance)) {
                  instance = instance[0];
                }
                if (instance) {
                  instance.clear();
                }
              }
              if (onChange) {
                const handlers = Array.isArray(onChange) ? onChange : [onChange];
                let inst = fpRef.current;
                if (Array.isArray(inst)) {
                  inst = inst[0];
                }
                handlers.forEach(fn => fn([], "", inst!));
              }
            }}
          >
            <i className="fa-light fa-xmark h-4 w-4" aria-hidden="true"></i>
          </button>
        )}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <i className="fa-light fa-calendar size-6" aria-hidden="true"></i>
        </span>
      </div>
    </div>
  );
}