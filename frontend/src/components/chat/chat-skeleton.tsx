import { Skeleton } from "@/components/ui/skeleton";

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 max-w-[80%] space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function DocumentListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

