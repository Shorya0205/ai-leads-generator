import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="relative max-w-lg w-full text-center space-y-8 animate-fade-up">
        {/* Glow blob */}
        <div className="pointer-events-none absolute top-[-8rem] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-blue-100 dark:bg-blue-950/30 blur-3xl opacity-60" />

        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center shadow-lg">
          <FileQuestion className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        </div>

        {/* 404 Text */}
        <div className="relative space-y-3">
          <p className="text-8xl font-black tracking-tighter text-foreground/10">
            404
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground -mt-4">
            Page not found
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Check the URL or head back to the dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="relative flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-foreground text-background font-bold text-sm shadow-lg hover:opacity-90 transition-all duration-200 active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl border border-border bg-card font-bold text-sm text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
