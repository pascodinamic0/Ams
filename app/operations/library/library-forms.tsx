"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBook, issueBook, returnBook } from "@/lib/actions/library";
import { toast } from "@/lib/toast";

interface BookFormProps {
  branchId: string;
}

export function BookForm({ branchId }: BookFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createBook({
      title,
      author: author || undefined,
      isbn: isbn || undefined,
      quantity: Number(quantity),
      branch_id: branchId,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to add book");
      return;
    }
    toast.success("Book added");
    setTitle("");
    setAuthor("");
    setIsbn("");
    setQuantity("1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Author</Label>
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>
      <div>
        <Label>ISBN</Label>
        <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
      </div>
      <div>
        <Label>Quantity</Label>
        <Input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Add book</Button>
      </div>
    </form>
  );
}

interface IssueFormProps {
  books: { id: string; title: string; available: number }[];
  students: { id: string; name: string }[];
}

export function IssueBookForm({ books, students }: IssueFormProps) {
  const router = useRouter();
  const [bookId, setBookId] = useState(books[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);

  const availableBooks = books.filter((b) => b.available > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId || !studentId || !dueAt) {
      toast.error("Fill in all fields");
      return;
    }
    setLoading(true);
    const result = await issueBook({ book_id: bookId, student_id: studentId, due_at: dueAt });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to issue book");
      return;
    }
    toast.success("Book issued");
    setDueAt("");
    router.refresh();
  }

  if (availableBooks.length === 0 || students.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Add books with available copies and students before issuing.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label>Book</Label>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
          {availableBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({b.available} available)
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Student</Label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Due date</Label>
        <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Issue book</Button>
      </div>
    </form>
  );
}

export function ReturnBookButton({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    const result = await returnBook(issueId);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to return book");
      return;
    }
    toast.success("Book returned");
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleReturn} disabled={loading}>
      Return
    </Button>
  );
}
