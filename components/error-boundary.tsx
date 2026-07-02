"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-8 dark:border-stone-800 dark:bg-stone-950">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Something went wrong
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
