import { redirect } from "next/navigation";

/** Standalone guardian create is folded into student onboarding. */
export default function NewGuardianPage() {
  redirect("/academic/students/new");
}
