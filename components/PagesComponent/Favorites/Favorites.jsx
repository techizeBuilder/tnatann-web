"use client";
import AdCard from "@/components/Common/AdCard";
import NoData from "@/components/EmptyStates/NoData";
import AdCardSkeleton from "@/components/Common/AdCardSkeleton";
import { Button } from "@/components/ui/button";
import { t } from "@/utils";
import { getFavouriteApi } from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const Favorites = () => {
  const { lang: langCode } = useParams();
  const [favoritesData, setFavoriteData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [IsLoadMore, setIsLoadMore] = useState(false);

  const fetchFavoriteItems = async (page) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }
      const response = await getFavouriteApi.getFavouriteApi({ page, limit: 12 });
      const data = response?.data?.data?.data;
      if (page === 1) {
        setFavoriteData(data);
      } else {
        setFavoriteData((prevData) => [...prevData, ...data]);
      }
      setCurrentPage(response?.data?.data.current_page);
      if (response?.data?.data.current_page < response?.data?.data.last_page) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  useEffect(() => {
    fetchFavoriteItems(currentPage);
  }, [currentPage, langCode]);

  const handleLoadMore = () => {
    setIsLoadMore(true);
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleLike = (id) => {
    fetchFavoriteItems(1);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-6">
        {isLoading ? (
          [...Array(12)].map((_, index) => <AdCardSkeleton key={index} />)
        ) : favoritesData && favoritesData.length > 0 ? (
          favoritesData?.map(
            (fav) =>
              fav?.is_liked && (
                <AdCard key={fav?.id} item={fav} handleLike={handleLike} />
              )
          )
        ) : (
          <div className="col-span-full">
            <NoData name={t("favorites")} />
          </div>
        )}
      </div>
      {favoritesData && favoritesData.length > 0 && hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isLoading || IsLoadMore}
            onClick={handleLoadMore}
          >
            {IsLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
};

export default Favorites;
