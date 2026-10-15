import { useState } from "react";
import { getDefaultCountryCode, t, timeAgo } from "@/utils";
import { chatListApi, itemOfferApi, manageFavouriteApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";
import { CurrentLanguageData } from "@/redux/reducer/languageSlice";
import CustomLink from "@/components/Common/CustomLink";
import { toast } from "sonner";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import CustomImage from "./CustomImage";
import { useNavigate } from "@/components/Hooks/useNavigate";
import { ChatTeardropDotsIcon, CrownIcon, HeartIcon, PhoneCallIcon, SealCheckIcon } from "@phosphor-icons/react";
import { useDebouncedToggle } from "@/components/Hooks/useDebouncedToggle";

const AdCard = ({ item, handleLike }) => {
  const userData = useSelector(userSignUpData);
  const { navigate } = useNavigate();
  const { country_code, code } = useSelector(CurrentLanguageData);
  const locale = country_code
    ? `${code}-${country_code}`
    : code ?? "en";
  const isJobCategory = Number(item?.category?.is_job_category) === 1;
  const translated_item = item.translated_item;
  const [isStartingChat, setIsStartingChat] = useState(false);

  const isHidePrice = isJobCategory
    ? !item?.formatted_salary_range
    : !item?.formatted_price;

  const price = isJobCategory
    ? item?.formatted_salary_range
    : item?.formatted_price;

  const isOwnListing = userData?.id === item?.user_id;

  const productLink = isOwnListing
    ? `/my-listing/${item?.slug}`
    : `/ad-details/${item.slug}`;

  const regionCode = item?.region_code?.toUpperCase();
  const countryCode = getDefaultCountryCode(regionCode) || "";
  const prefix = countryCode ? `+${countryCode}` : "";
  const mobile = item?.contact ? `${prefix}${item.contact}` : null;

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
      (liked) => handleLike(item?.id, liked), // parent just sets the flag, no toggling logic there
      () => manageFavouriteApi.manageFavouriteApi({ item_id: item?.id }),
      () => toast.error(t("failedToLike"))
    );
  };

  const handleCardChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData) {
      setIsLoginOpen(true);
      return;
    }
    try {
      setIsStartingChat(true);
      if (item?.is_already_offered) {
        const item_offer_id = item?.item_offers?.[0]?.id;
        const response = await chatListApi.chatList({ type: "buyer", item_offer_id });
        if (response?.data?.error === false) {
          const chatId = response?.data?.data?.data[0]?.id;
          const adId = response?.data?.data?.data[0]?.item?.id;
          navigate("/chat?activeTab=buying&chatid=" + chatId + "&chat_ad_id=" + adId);
        } else {
          toast.error(response?.data?.message);
        }
      } else {
        const response = await itemOfferApi.offer({ item_id: item?.id });
        if (response?.data?.error === false) {
          const { data } = response.data;
          navigate("/chat?activeTab=buying&chatid=" + data?.id + "&chat_ad_id=" + item?.id);
        } else {
          toast.error(response?.data?.message);
        }
      }
    } catch (error) {
      toast.error(t("unableToStartChat"));
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleCardCall = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData) {
      setIsLoginOpen(true);
      return;
    }
    if (mobile) {
      window.location.href = `tel:${mobile}`;
    }
  };

  return (
    <CustomLink
      href={productLink}
      className="border p-2 rounded-2xl flex flex-col gap-2 h-full bg-white"
    >
      <div className="relative">
        <CustomImage
          src={item?.image}
          width={288}
          height={249}
          className="w-full aspect-square rounded object-cover"
          alt={translated_item?.name || "Product"}
        />
        {item?.is_elite ? (
          <div className="flex items-center gap-1 ltr:rounded-tl rtl:rounded-tr py-0.5 px-1 bg-amber-500 absolute top-0 ltr:left-0 rtl:right-0">
            <CrownIcon size={16} color="white" weight="fill" />
            <p className="text-white text-xs sm:text-sm">{t("elite")}</p>
          </div>
        ) : item?.is_feature ? (
          <div className="flex items-center gap-1 ltr:rounded-tl rtl:rounded-tr py-0.5 px-1 bg-primary absolute top-0 ltr:left-0 rtl:right-0">
            <SealCheckIcon size={16} color="white" weight="bold" />
            <p className="text-white text-xs sm:text-sm">{t("featured")}</p>
          </div>
        ) : null}

        <div
          onClick={handleLikeItem}
          className="absolute size-6 sm:size-9 ltr:right-2 rtl:left-2 top-2 bg-white rounded-full flex items-center justify-center text-primary"
        >
          <button>
            <HeartIcon size={24} weight={item?.is_liked ? 'fill' : 'regular'} />
          </button>
        </div>

        {item?.is_elite && !isOwnListing && (
          <div className="absolute bottom-2 ltr:right-2 rtl:left-2 flex items-center gap-1.5">
            <button
              onClick={handleCardChat}
              disabled={isStartingChat}
              aria-label={t("startChat")}
              className="size-7 sm:size-8 rounded-full bg-blue-900 text-white flex items-center justify-center shadow"
            >
              <ChatTeardropDotsIcon size={16} weight="fill" />
            </button>
            {mobile && (
              <button
                onClick={handleCardCall}
                aria-label={t("call")}
                className="size-7 sm:size-8 rounded-full bg-blue-900 text-white flex items-center justify-center shadow"
              >
                <PhoneCallIcon size={16} weight="fill" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-between gap-2">
        {isHidePrice ? (
          <p className="text-sm sm:text-base font-medium line-clamp-1">
            {translated_item?.name}
          </p>
        ) : (
          <p
            className="text-sm sm:text-lg font-bold break-all text-balance line-clamp-2"
            title={price}
          >
            {price}
          </p>
        )}

        <p className="text-xs sm:text-sm opacity-65 whitespace-nowrap">
          {timeAgo(item?.created_at, locale)}&lrm;
        </p>
      </div>

      {!isHidePrice && (
        <p className="text-sm sm:text-base font-medium line-clamp-1">
          {translated_item?.name}
        </p>
      )}
      <p className="text-xs sm:text-sm opacity-65 line-clamp-1">
        {item?.translated_address}
      </p>
    </CustomLink>
  );
};

export default AdCard;
