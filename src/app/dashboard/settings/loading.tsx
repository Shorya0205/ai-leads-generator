import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-5 w-80 rounded-lg" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* SMTP Settings Card */}
      <div className="rounded-3xl border border-border bg-card/50 p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>

      {/* Profile Section */}
      <div className="rounded-3xl border border-border bg-card/50 p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  );
}
