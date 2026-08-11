"use client";

import { Button } from "@/components/ui/button";

export function PrintReceiptButton({ label }: { label: string }) {
  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
