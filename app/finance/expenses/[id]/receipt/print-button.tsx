"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintReceiptButton({
  label,
  autoPrint = false,
}: {
  label: string;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      <Download className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}
