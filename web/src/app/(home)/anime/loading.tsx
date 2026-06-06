import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-14" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-16" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="aspect-2/3 w-full rounded-none" />
        ))}
      </div>
    </>
  );
}
