import { useId } from "react";
import AdCardSkeleton from "../../Common/AdCardSkeleton";

const AllItemsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map(() => (
        <AdCardSkeleton key={useId()} />
      ))}
    </>
  );
};

export default AllItemsSkeleton;
