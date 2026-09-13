import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[2rem] border border-border bg-card/50 p-7 min-h-[180px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-11 w-11 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-20 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns Table Skeleton */}
      <div className="rounded-3xl border border-border bg-card/50 p-6 space-y-5">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-52 rounded-lg" />
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
