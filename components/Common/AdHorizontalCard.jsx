import { t, timeAgo } from "@/utils";
import { HeartIcon, SealCheckIcon } from "@phosphor-icons/react";
import { manageFavouriteApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";
import { toast } from "sonner";
import CustomLink from "@/components/Common/CustomLink";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import CustomImage from "./CustomImage";
import { useDebouncedToggle } from "@/components/Hooks/useDebouncedToggle";

const AdHorizontalCard = ({ item, handleLike }) => {
  const userData = useSelector(userSignUpData);
  const translated_item = item.translated_item;

  const productLink =
    userData?.id === item?.user_id
      ? `/my-listing/${item?.slug}`
      : `/ad-details/${item.slug}`;
  const isJobCategory = Number(item?.category?.is_job_category) === 1;

  const isHidePrice = isJobCategory
    ? !item?.formatted_salary_range
    : !item?.formatted_price;

  const price = isJobCategory
    ? item?.formatted_salary_range
    : item?.formatted_price;

  const toggleLike = useDebouncedToggle();

  const handleLikeItem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData) {
      setIsLoginOpen(true);
      return;
    }
    toggleLike(
      item?.id,
      item?.is_liked,
      (liked) => handleLike(item?.id, liked),
      () => manageFavouriteApi.manageFavouriteApi({ item_id: item?.id }),
      () => toast.error(t("failedToLike"))
    );
  };

  return (
    <CustomLink
      href={productLink}
      className="border p-2 rounded-md flex gap-2 sm:gap-4 w-full relative"
    >
      <CustomImage
        src={item?.image}
        width={219}
        height={190}
        alt={translated_item?.name || "Product"}
        className="w-25 sm:w-54.75 h-auto aspect-square sm:aspect-219/190 rounded object-cover"
      />
      <div className="flex flex-col gap-1 sm:gap-2 justify-between flex-1 relative min-w-0">
        <div className="flex items-center gap-1">
          {item?.is_feature && (
            <div className="flex items-center gap-1 rounded-tl-md py-0.5 px-1 bg-primary w-fit mb-1">
              <SealCheckIcon size={16} color="white" weight="bold" />
              <p className="text-white text-xs sm:text-sm">{t("featured")}</p>
            </div>
          )}
          <div
            onClick={handleLikeItem}
            className="ms-auto size-6 sm:size-9 bg-white rounded-full flex items-center justify-center text-primary"
          >
            <button>
              <HeartIcon className="size-4 sm:size-6" weight={item?.is_liked ? 'fill' : 'regular'} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:gap-2">
          {!isHidePrice && (
            <p className="text-base sm:text-xl font-bold truncate" title={price}>
              {price}
            </p>
          )}

          <p
            className="text-base font-medium line-clamp-1"
            title={translated_item?.name}
          >
            {translated_item?.name}
          </p>

          <p className="text-xs sm:text-sm opacity-65 line-clamp-1">
            {item?.translated_address}
          </p>
        </div>
        <div className="flex justify-end">
          <p className="text-xs sm:text-sm opacity-65 whitespace-nowrap">
            {timeAgo(item?.created_at)}&lrm;
          </p>
        </div>
      </div>
    </CustomLink>
  );
};

export default AdHorizontalCard;
