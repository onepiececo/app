import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="-mx-10 -mt-13 h-40 sm:h-56 lg:h-64 xl:-mx-16 xl:-mt-19">
        <Skeleton className="size-full rounded-none" />
      </div>

      <header className="-mt-20 flex flex-col gap-4 sm:-mt-24 sm:flex-row sm:items-end sm:gap-6">
        <Skeleton className="aspect-2/3 w-32 shrink-0 rounded-none sm:w-44" />
        <div className="flex min-w-0 flex-col gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
      </header>

      <section className="flex flex-wrap gap-x-8 gap-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-16" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-12" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24" />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-16" />
        <div className="h-40 overflow-hidden">
          <div className="flex items-start gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-2/3 w-24 shrink-0 rounded-none" />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-20" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-2/3 w-full rounded-none" />
          ))}
        </div>
      </section>
    </>
  );
}
