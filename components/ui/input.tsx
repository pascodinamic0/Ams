import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950 dark:placeholder:text-zinc-500 ${
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-zinc-300 dark:border-zinc-700"
      } ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";

export { Input };
