"use client";

import { useState, useEffect } from "react";
import { Input } from "./input";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  value?: string;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  value: controlledValue,
  debounceMs = 300,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      onSearch(internalValue);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [internalValue, debounceMs, onSearch]);

  useEffect(() => {
    if (controlledValue !== undefined) setInternalValue(controlledValue);
  }, [controlledValue]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <Input
        type="search"
        role="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {internalValue && (
        <button
          type="button"
          onClick={() => setInternalValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
