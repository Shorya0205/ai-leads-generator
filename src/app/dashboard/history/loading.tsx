import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-52 rounded-xl" />
        <Skeleton className="h-5 w-72 rounded-lg" />
      </div>

      {/* Activity Calendar Skeleton */}
      <div className="rounded-3xl border border-border bg-card/50 p-6 space-y-4">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Campaign List Skeleton */}
      <div className="rounded-3xl border border-border bg-card/50 p-6 space-y-5">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-b border-border/50 last:border-0"
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-64 rounded-lg" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-2 w-24 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
