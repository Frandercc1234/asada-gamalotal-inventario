import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card className="p-0">
        <SkeletonTable rows={6} cols={5} />
      </Card>
    </div>
  );
}
