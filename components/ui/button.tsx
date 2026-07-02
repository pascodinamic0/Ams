import * as React from "react";

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
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
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
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
