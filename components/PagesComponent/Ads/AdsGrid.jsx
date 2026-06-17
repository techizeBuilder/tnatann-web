import AdCard from "@/components/Common/AdCard";
import AdCardSkeleton from "@/components/Common/AdCardSkeleton";
import AdHorizontalCard from "@/components/Common/AdHorizontalCard";
import AdHorizontalCardSkeleton from "@/components/Common/AdHorizontalCardSkeleton";
import NoData from "@/components/EmptyStates/NoData";
import { Button } from "@/components/ui/button";
import { t } from "@/utils";

const AdsGrid = ({
  advertisements,
  view,
  handleLike,
  handleProdLoadMore,
}) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        {advertisements?.isLoading ? (
          Array.from({ length: 12 }).map((_, index) =>
            view === "list" ? (
              <div className="col-span-12" key={index}>
                <AdHorizontalCardSkeleton />
              </div>
            ) : (
              <div key={index} className="col-span-12 sm:col-span-6 xl:col-span-4">
                <AdCardSkeleton />
              </div>
            )
          )
        ) : advertisements.data && advertisements.data.length > 0 ? (
          advertisements.data?.map((item, index) =>
            view === "list" ? (
              <div className="col-span-12" key={index}>
                <AdHorizontalCard item={item} handleLike={handleLike} />
              </div>
            ) : (
              <div className="col-span-6 lg:col-span-4" key={index}>
                <AdCard item={item} handleLike={handleLike} />
              </div>
            )
          )
        ) : (
          <div className="col-span-12">
            <NoData name={t("ads")} />
          </div>
        )}
      </div>
      {advertisements.data &&
        advertisements.data.length > 0 &&
        advertisements.hasMore && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              className="text-sm sm:text-base text-primary w-[256px]"
              disabled={advertisements.isLoading || advertisements.isLoadMore}
              onClick={handleProdLoadMore}
            >
              {advertisements.isLoadMore ? t("loading") : t("loadMore")}
            </Button>
          </div>
        )}
    </>
  );
};

export default AdsGrid;
