import { redirect } from "next/navigation";

export default function OutstandingFeesPage() {
  redirect("/finance/invoices");
}
