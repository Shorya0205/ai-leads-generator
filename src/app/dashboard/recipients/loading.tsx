import { Skeleton } from "@/components/ui/skeleton";

export default function RecipientsLoading() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-5 w-64 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
      </div>

      {/* Recipients Table Skeleton */}
      <div className="rounded-3xl border border-border bg-card/50 p-6 space-y-5">
        {/* Search Bar */}
        <Skeleton className="h-11 w-full max-w-sm rounded-xl" />

        {/* Table Header */}
        <div className="flex items-center gap-4 py-3 border-b border-border/50">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md flex-1" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0"
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-52 rounded-md flex-1" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
