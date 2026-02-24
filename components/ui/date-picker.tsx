"use client";

import "react-day-picker/style.css";
import * as React from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { Input } from "./input";

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Input
        readOnly
        value={value ? format(value, "PPP") : ""}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        className="cursor-pointer"
      />
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(d) => {
                onChange(d);
                setOpen(false);
              }}
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}
