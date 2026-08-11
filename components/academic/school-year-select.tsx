"use client";

import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  getCurrentSchoolYearStart,
  schoolYearOptions,
} from "@/lib/academic/school-year";

type Props = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "value" | "defaultValue"
> & {
  label?: string;
  error?: boolean;
  value?: number | string;
  defaultValue?: number | string;
  centerStartYear?: number;
  before?: number;
  after?: number;
};

export const SchoolYearSelect = forwardRef<HTMLSelectElement, Props>(
  function SchoolYearSelect(
    {
      id = "school_year",
      name = "school_year",
      value,
      defaultValue,
      label,
      required,
      error,
      className,
      centerStartYear = getCurrentSchoolYearStart(),
      before = 3,
      after = 4,
      ...rest
    },
    ref
  ) {
    const options = schoolYearOptions(centerStartYear, before, after).map(
      (opt) => ({
        value: String(opt.value),
        label: opt.label,
      })
    );

    return (
      <div className={className}>
        {label ? (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        ) : null}
        <Select
          ref={ref}
          id={id}
          name={name}
          options={options}
          error={error}
          required={required}
          value={value !== undefined ? String(value) : undefined}
          defaultValue={
            value === undefined
              ? String(defaultValue ?? centerStartYear)
              : undefined
          }
          {...rest}
        />
      </div>
    );
  }
);
