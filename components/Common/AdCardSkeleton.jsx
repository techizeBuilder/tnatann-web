import { Skeleton } from "../ui/skeleton";

const AdCardSkeleton = () => {
  return (
    <div className="border rounded-lg flex flex-col overflow-hidden">
      <div className="p-2 pb-0">
        <Skeleton className="w-full aspect-[4/3] rounded" />
      </div>
      <div className="flex flex-col gap-1.5 p-3 pt-2.5">
        <div className="space-between">
          <Skeleton className="w-1/3 h-5" />
          <Skeleton className="w-1/5 h-3" />
        </div>
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-2/3 h-3 mt-1" />
      </div>
    </div>
  );
};

export default AdCardSkeleton;
