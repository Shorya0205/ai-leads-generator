"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This section encountered an unexpected error. Your other data is
            safe — try refreshing or go back to the dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-semibold text-sm shadow-md hover:opacity-90 transition-all active:scale-[0.97]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card font-semibold text-sm text-foreground hover:bg-accent transition-all active:scale-[0.97]"
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
