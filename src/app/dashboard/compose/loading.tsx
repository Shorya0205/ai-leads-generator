import { Skeleton } from "@/components/ui/skeleton";

export default function ComposeLoading() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg" />
      </div>

      {/* Compose Form Skeleton */}
      <div className="rounded-3xl border border-border bg-card/50 p-8 space-y-6">
        {/* Recipients Section */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Subject Line */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Email Body */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Attachment & Options */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>

        {/* AI Generate Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
          <Skeleton className="h-12 w-56 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
