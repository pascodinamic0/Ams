export default function SchoolPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <a href="/schools" className="font-semibold">← Back to directory</a>
      </header>
      {children}
    </div>
  );
}
