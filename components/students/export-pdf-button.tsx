"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Props = {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

export function ExportPdfButton({
  label,
  variant = "primary",
  size = "sm",
}: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className="print:hidden"
      onClick={() => window.print()}
    >
      <Download className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}
