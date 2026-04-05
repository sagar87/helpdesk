import { Skeleton } from "@/components/ui/skeleton";

export function TicketDetailSkeleton() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-96" />
      <div className="grid grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
