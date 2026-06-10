"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent, deleteEvent } from "@/lib/actions/events";
import { toast } from "@/lib/toast";

export function EventForm({ branchId }: { branchId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"event" | "holiday">("event");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createEvent({
      title,
      date,
      type,
      description: description || undefined,
      branch_id: branchId,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to create event");
      return;
    }
    toast.success("Event created");
    setTitle("");
    setDate("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "event" | "holiday")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="event">Event</option>
          <option value="holiday">Holiday</option>
        </select>
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Add event</Button>
      </div>
    </form>
  );
}

export function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    const result = await deleteEvent(id);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to delete event");
      return;
    }
    toast.success("Event deleted");
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>
      Delete
    </Button>
  );
}
