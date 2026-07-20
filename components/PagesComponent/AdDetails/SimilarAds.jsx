import { useEffect, useState } from "react";
import SectionBanners from "@/components/CustomBanners/SectionBanners";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { allItemApi } from "@/utils/api";
import AdCard from "@/components/Common/AdCard";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/redux/reducer/languageSlice";
import { t } from "@/utils";
import { getCityData, getKilometerRange } from "@/redux/reducer/locationSlice";

const SimilarAds = ({ productDetails, aboveBanners, belowBanners }) => {
  const [similarData, setSimilarData] = useState([]);
  const isRTL = useSelector(getIsRtl);
  const location = useSelector(getCityData);
  const KmRange = useSelector(getKilometerRange);

  const fetchSimilarData = async (cateID) => {
    try {
      const response = await allItemApi.getItems({
        category_id: cateID,
        excluded_item_id: productDetails?.id,
        ...(location?.lat &&
          location?.long && {
          latitude: location?.lat,
          longitude: location?.long,
          radius: KmRange,
        }),
      });
      const responseData = response?.data;
      if (responseData) {
        const { data } = responseData;
        setSimilarData(data?.data || []);
      } else {
        console.error("Invalid response:", response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    if (productDetails?.category_id) {
      fetchSimilarData(productDetails?.category_id);
    }
  }, [productDetails?.category_id]);

  if (similarData && similarData.length === 0) {
    return null;
  }

  const handleLikeAllData = (id, liked) => {
    setSimilarData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: liked } : item))
    );
  };

  return (
    <div className="flex flex-col gap-5 mt-8">
      <SectionBanners banners={aboveBanners} className="mb-3" />
      <h2 className="text-2xl font-medium">{t("relatedAds")}</h2>
      <Carousel
        key={isRTL ? "rtl" : "ltr"}
        opts={{
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <CarouselContent>
          {similarData?.map((item) => (
            <CarouselItem
              key={item.id}
              className="md:basis-1/3 lg:basis-[25%] basis-2/3 sm:basis-1/2"
            >
              <AdCard item={item} handleLike={handleLikeAllData} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden disabled:hidden md:flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full disabled:pointer-events-auto" />
        <CarouselNext className="hidden disabled:hidden md:flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full disabled:pointer-events-auto" />

        {similarData?.length > 1 && (
          <div className="md:hidden flex items-center justify-center gap-3 mt-4">
            <CarouselPrevious className="static translate-y-0 bg-primary text-white rounded-full h-10 w-10 rtl:scale-x-[-1]" />
            <CarouselNext className="static translate-y-0 bg-primary text-white rounded-full h-10 w-10 rtl:scale-x-[-1]" />
          </div>
        )}
      </Carousel>
      <SectionBanners banners={belowBanners} className="mt-3" />
    </div >
  );
};

export default SimilarAds;
