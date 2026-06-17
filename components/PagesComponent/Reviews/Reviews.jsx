"use client";
import { t } from "@/utils";
import RatingsSummary from "./RatingsSummary";
import RatingsSummarySkeleton from "./RatingsSummarySkeleton";
import { useEffect, useState } from "react";
import { getMyReviewsApi } from "@/utils/api";
import MyReviewsCard from "./MyReviewsCard.jsx";
import MyReviewsCardSkeleton from "@/components/PagesComponent/Reviews/MyReviewsCardSkeleton";
import { Button } from "@/components/ui/button";
import NoData from "@/components/EmptyStates/NoData";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const Reviews = () => {
  const [MyReviews, setMyReviews] = useState([]);
  const [AverageRating, setAverageRating] = useState("");
  const [RatingsCount, setRatingsCount] = useState({});
  const [CurrentPage, setCurrentPage] = useState(1);
  const [ReviewHasMore, setReviewHasMore] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);
  const [IsLoadMore, setIsLoadMore] = useState(false);
  const { lang: langCode } = useParams();

  const getReveiws = async (page) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }
      const res = await getMyReviewsApi.getMyReviews({ page });
      if (res?.data?.error === false) {
        setAverageRating(res?.data?.data?.average_rating);
        setMyReviews(res?.data?.data?.ratings?.data);
        setRatingsCount(res?.data?.data?.ratings_count);
        setCurrentPage(res?.data?.data?.ratings?.current_page);
        if (
          res?.data?.data?.ratings?.current_page <
          res?.data?.data?.ratings?.last_page
        ) {
          setReviewHasMore(true);
        }
      } else {
        toast.error(t("somethingWentWrong"))
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somethingWentWrong"))
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  useEffect(() => {
    getReveiws(1);
  }, [langCode]);

  const handleReviewLoadMore = () => {
    setIsLoadMore(true);
    getReveiws(CurrentPage + 1);
  };

  return IsLoading ? (
    <>
      <RatingsSummarySkeleton />
      <MyReviewsCardSkeleton />
    </>
  ) : MyReviews && MyReviews.length > 0 ? (
    <>
      <RatingsSummary averageRating={AverageRating} ratings_count={RatingsCount} />
      <div className="mt-[30px] p-2 sm:p-4 bg-muted rounded-xl flex flex-col gap-[30px]">
        {MyReviews?.map((rating) => (
          <MyReviewsCard
            rating={rating}
            key={rating?.id}
            setMyReviews={setMyReviews}
          />
        ))}
      </div>
      {ReviewHasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={IsLoading || IsLoadMore}
            onClick={handleReviewLoadMore}
          >
            {IsLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  ) : (
    <NoData name={t("reviews")} />
  );
};

export default Reviews;
