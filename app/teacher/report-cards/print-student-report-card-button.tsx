"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  targetId: string;
  label: string;
  documentTitle?: string;
};

export function PrintStudentReportCardButton({
  targetId,
  label,
  documentTitle,
}: Props) {
  function handlePrint() {
    const el = document.getElementById(targetId);
    if (!el) return;

    const previousTitle = document.title;
    if (documentTitle) document.title = documentTitle;

    document.body.classList.add("printing-one-report-card");
    el.classList.add("print-target");

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove("printing-one-report-card");
      el.classList.remove("print-target");
      document.title = previousTitle;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 2000);
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="print:hidden"
      onClick={handlePrint}
    >
      <Download className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}
