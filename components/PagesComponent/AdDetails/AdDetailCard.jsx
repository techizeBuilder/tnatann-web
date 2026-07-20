import { formatDateMonthYear, t } from "@/utils/index";
import { cn } from "@/lib/utils";
import { CalendarCheckIcon, HeartIcon } from "@phosphor-icons/react";
import { manageFavouriteApi } from "@/utils/api";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { getIsLoggedIn } from "@/redux/reducer/authSlice";
import { useSelector } from "react-redux";
import { getCompanyName } from "@/redux/reducer/settingSlice";
import ShareDropdown from "@/components/Common/ShareDropdown";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";

const AdDetailCard = ({ productDetails, setProductDetails }) => {
  const path = usePathname();
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${path}`;
  const translated_item = productDetails?.translated_item;
  const isLoggedIn = useSelector(getIsLoggedIn);
  const CompanyName = useSelector(getCompanyName);
  const FbTitle =
    (translated_item?.name || productDetails?.name) + " | " + CompanyName;
  const headline = `🚀 Discover the perfect deal! Explore "${translated_item?.name || productDetails?.name
    }" from ${CompanyName} and grab it before it's gone. Shop now at`;

  const isJobCategory = Number(productDetails?.category?.is_job_category) === 1;
  const price = isJobCategory
    ? productDetails?.formatted_salary_range
    : productDetails?.formatted_price;

  const handleLikeItem = async () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const response = await manageFavouriteApi.manageFavouriteApi({
        item_id: productDetails?.id,
      });
      if (response?.data?.error === false) {
        setProductDetails((prev) => ({
          ...prev,
          is_liked: !productDetails?.is_liked,
        }));
      }
      toast.success(response?.data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-lg">
      <div className="flex justify-between max-w-full">
        <div className="flex flex-col gap-2">
          <h1
            className="text-xl sm:text-2xl font-medium break-all line-clamp-2"
            title={translated_item?.name || productDetails?.name}
          >
            {translated_item?.name || productDetails?.name}
          </h1>
          <h2
            className="text-2xl sm:text-3xl text-primary font-bold break-all text-balance line-clamp-2"
            title={price}
          >
            {price}
          </h2>
        </div>
        {/* Tablet & Desktop only: like + share buttons (vertical, beside title/price) */}
        <div className="hidden sm:flex flex-col gap-4">
          <button
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border"
            onClick={handleLikeItem}
          >
            <HeartIcon
              className={cn("size-4 sm:size-5", productDetails?.is_liked && "text-primary")}
              weight={productDetails?.is_liked ? "fill" : "regular"}
            />
          </button>
          <ShareDropdown
            url={currentUrl}
            title={FbTitle}
            headline={headline}
            companyName={CompanyName}
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border bg-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarCheckIcon className="shrink-0 size-4" weight="bold" />
          <span>{t("postedOn")}: {formatDateMonthYear(productDetails?.created_at)}</span>
        </div>

        {/* Mobile only: like + share buttons (horizontal, beside date) */}
        <div className="flex gap-2 sm:hidden">
          <button
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border"
            onClick={handleLikeItem}
          >
            <HeartIcon
              className={cn("size-4 sm:size-5", productDetails?.is_liked && "text-primary")}
              weight={productDetails?.is_liked ? "fill" : "regular"}
            />
          </button>
          <ShareDropdown
            url={currentUrl}
            title={FbTitle}
            headline={headline}
            companyName={CompanyName}
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default AdDetailCard;
