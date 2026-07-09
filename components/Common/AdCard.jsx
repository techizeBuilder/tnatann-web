import { formatDate, t } from "@/utils";
import { BiBadgeCheck } from "react-icons/bi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { manageFavouriteApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";
import CustomLink from "@/components/Common/CustomLink";
import { toast } from "sonner";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import CustomImage from "./CustomImage";

const AdCard = ({ item, handleLike }) => {
  const userData = useSelector(userSignUpData);
  const isJobCategory = Number(item?.category?.is_job_category) === 1;
  const translated_item = item.translated_item;

  const isHidePrice = isJobCategory
    ? !item?.formatted_salary_range
    : !item?.formatted_price;

  const price = isJobCategory
    ? item?.formatted_salary_range
    : item?.formatted_price;

  const productLink =
    userData?.id === item?.user_id
      ? `/my-listing/${item?.slug}`
      : `/ad-details/${item.slug}`;

  const handleLikeItem = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!userData) {
        setIsLoginOpen(true);
        return;
      }
      const response = await manageFavouriteApi.manageFavouriteApi({
        item_id: item?.id,
      });
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        handleLike(item?.id);
      } else {
        toast.error(t("failedToLike"));
      }
    } catch (error) {
      console.log(error);
      toast.error(t("failedToLike"));
    }
  };

  return (
    <CustomLink
      href={productLink}
      className={`border rounded-lg flex flex-col h-full overflow-hidden bg-card transition-shadow hover:shadow-md ${
        item?.is_feature
          ? "ltr:border-l-4 rtl:border-r-4 ltr:border-l-amber-400 rtl:border-r-amber-400"
          : ""
      }`}
    >
      <div className="relative p-2 pb-0">
        <CustomImage
          src={item?.image}
          width={288}
          height={216}
          className="w-full aspect-[4/3] rounded object-cover"
          alt={translated_item?.name || "Product"}
        />
        {item?.is_feature && (
          <div className="flex items-center gap-1 rounded-sm py-0.5 px-1.5 bg-amber-400 absolute bottom-0 ltr:left-2 rtl:right-2">
            <BiBadgeCheck size={14} className="text-black" />
            <p className="text-black text-[10px] font-bold uppercase tracking-wide">
              {t("featured")}
            </p>
          </div>
        )}

        <div
          onClick={handleLikeItem}
          className="absolute size-7 sm:size-9 ltr:right-4 rtl:left-4 top-4 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"
        >
          {item?.is_liked ? (
            <button>
              <FaHeart className="size-4 sm:size-5" />
            </button>
          ) : (
            <button>
              <FaRegHeart className="size-4 sm:size-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-1.5 p-3 pt-2.5">
        <div className="space-between gap-2">
          {isHidePrice ? (
            <p className="text-base sm:text-lg font-bold line-clamp-1">
              {translated_item?.name}
            </p>
          ) : (
            <p
              className="text-base sm:text-xl font-bold break-all text-balance line-clamp-2"
              title={price}
            >
              {price}
            </p>
          )}

          <p className="text-[10px] sm:text-xs uppercase text-muted-foreground whitespace-nowrap">
            {formatDate(item?.created_at)}&lrm;
          </p>
        </div>

        {!isHidePrice && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {translated_item?.name}
          </p>
        )}

        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground line-clamp-1 mt-auto pt-1">
          {item?.translated_address}
        </p>
      </div>
    </CustomLink>
  );
};

export default AdCard;
