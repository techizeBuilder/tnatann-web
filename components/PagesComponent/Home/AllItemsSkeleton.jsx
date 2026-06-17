import { useId } from "react";
import AdCardSkeleton from "../../Common/AdCardSkeleton";

const AllItemsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 8 }).map(() => (
        <AdCardSkeleton key={useId()} />
      ))}
    </>
  );
};

export default AllItemsSkeleton;
