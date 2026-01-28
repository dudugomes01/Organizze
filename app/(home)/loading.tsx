import { Skeleton } from "../_components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 pb-[100px] sm:grid-cols-[2fr,1fr] gap-0 sm:gap-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}

