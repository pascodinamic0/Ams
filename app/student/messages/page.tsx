import { redirect } from "next/navigation";

/** Students use the shared messaging inbox at /messages. */
export default function StudentMessagesPage() {
  redirect("/messages");
}
