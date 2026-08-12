import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-stone-200 dark:hover:bg-stone-700",
  ghost:
    "bg-transparent text-foreground hover:bg-secondary",
  danger:
    "bg-danger text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-danger",
  outline:
    "border border-border bg-transparent hover:bg-surface-raised",
};

const sizeStyles = {
  sm: "min-h-8 px-2.5 py-1.5 text-[clamp(0.6875rem,0.5rem+0.7vw,0.875rem)] sm:px-3",
  md: "min-h-10 px-3 py-2 text-[clamp(0.75rem,0.55rem+0.55vw,0.875rem)] sm:px-4",
  lg: "min-h-12 px-4 py-2.5 text-[clamp(0.875rem,0.65rem+0.55vw,1rem)] sm:px-6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex max-w-full min-w-0 items-center justify-center overflow-hidden rounded-lg font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
