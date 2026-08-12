"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBook, issueBook, returnBook } from "@/lib/actions/library";
import { toast } from "@/lib/toast";

interface BookFormProps {
  branchId: string;
}

export function BookForm({ branchId }: BookFormProps) {
  const t = useTranslations("operations");
  const te = useTranslations("errors");
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
      toast.error(typeof result.error === "string" ? result.error : te("failedAddBook"));
      return;
    }
    toast.success(t("bookAdded"));
    setTitle("");
    setAuthor("");
    setIsbn("");
    setQuantity("1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label>{t("colTitle")}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>{t("colAuthor")}</Label>
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>
      <div>
        <Label>{t("colIsbn")}</Label>
        <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
      </div>
      <div>
        <Label>{t("quantity")}</Label>
        <Input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">{t("addBook")}</Button>
      </div>
    </form>
  );
}

interface IssueFormProps {
  books: { id: string; title: string; available: number }[];
  students: { id: string; name: string }[];
}

export function IssueBookForm({ books, students }: IssueFormProps) {
  const t = useTranslations("operations");
  const te = useTranslations("errors");
  const router = useRouter();
  const [bookId, setBookId] = useState(books[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);

  const availableBooks = books.filter((b) => b.available > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId || !studentId || !dueAt) {
      toast.error(te("fillAllFields"));
      return;
    }
    setLoading(true);
    const result = await issueBook({ book_id: bookId, student_id: studentId, due_at: dueAt });
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : te("failedIssueBook"));
      return;
    }
    toast.success(t("bookIssued"));
    setDueAt("");
    router.refresh();
  }

  if (availableBooks.length === 0 || students.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        {t("addBooksBeforeIssuing")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label>{t("colBook")}</Label>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          required
        >
          {availableBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({t("copiesAvailable", { count: b.available })})
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>{t("colStudent")}</Label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          required
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>{t("dueDate")}</Label>
        <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">{t("lendBook")}</Button>
      </div>
    </form>
  );
}

export function ReturnBookButton({ issueId }: { issueId: string }) {
  const t = useTranslations("operations");
  const te = useTranslations("errors");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    const result = await returnBook(issueId);
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : te("failedReturnBook"));
      return;
    }
    toast.success(t("bookReturned"));
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleReturn} disabled={loading}>
      {t("returnBook")}
    </Button>
  );
}
