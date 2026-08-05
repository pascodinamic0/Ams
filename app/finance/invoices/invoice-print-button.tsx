"use client";

import { Button } from "@/components/ui/button";

export function InvoicePrintButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="print:hidden"
      onClick={() => window.print()}
    >
      {label}
    </Button>
  );
}
