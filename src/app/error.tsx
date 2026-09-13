"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="relative max-w-lg w-full text-center space-y-8 animate-fade-up">
        {/* Glow blob */}
        <div className="pointer-events-none absolute top-[-8rem] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-red-100 dark:bg-red-950/30 blur-3xl opacity-60" />

        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 flex items-center justify-center shadow-lg">
          <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>

        {/* Text */}
        <div className="relative space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            An unexpected error occurred. Don&apos;t worry — your data is safe.
            Try again or head back to the dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="relative flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-foreground text-background font-bold text-sm shadow-lg hover:opacity-90 transition-all duration-200 active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl border border-border bg-card font-bold text-sm text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
