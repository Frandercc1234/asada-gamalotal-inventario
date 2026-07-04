import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-4 sm:p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-4 h-60 w-full" />
        </Card>
        <Card className="p-0">
          <div className="border-b border-border px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-4 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-3">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-border px-5 py-4">
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-1" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
