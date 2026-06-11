export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-white px-3 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}
