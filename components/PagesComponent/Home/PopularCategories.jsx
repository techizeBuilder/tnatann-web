"use client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import PopularCategoriesSkeleton from "./PopularCategoriesSkeleton.jsx";
import PopularCategoryCard from "@/components/PagesComponent/Home/PopularCategoryCard";
import SubcategoryModal from "@/components/PagesComponent/Home/SubcategoryModal";
import { useSelector } from "react-redux";
import { t } from "@/utils";
import { getIsRtl } from "@/redux/reducer/languageSlice.js";
import { useParams } from "next/navigation.js";
import { popularCategoriesApi } from "@/utils/api.js";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

const PopularCategories = () => {
  const isRTL = useSelector(getIsRtl);
  const { lang: langCode } = useParams();
  const [cateData, setCateData] = useState([]);
  const [isCatLoading, setIsCatLoading] = useState(true);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isNextDisabled = !api || !api.canScrollNext();

  useEffect(() => {
    getCategories();
  }, [langCode]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api, cateData.length]);

  const getCategories = async () => {
    setIsCatLoading(true);
    try {
      const res = await popularCategoriesApi.getPopularCategories();
      if (res?.data?.error === false) {
        // API returns subcategories_count + subcategories[] on each item
        setCateData(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Popular categories error:", error);
    } finally {
      setIsCatLoading(false);
    }
  };

  const handleNext = () => {
    if (api && api.canScrollNext()) {
      api.scrollTo(current + 1);
    }
  };

  return isCatLoading ? (
    <PopularCategoriesSkeleton />
  ) : (
    cateData && cateData.length > 0 && (
      <>
        <section className="container mt-6 sm:mt-12">
          <div className="space-between">
            <h5 className="text-xl sm:text-2xl font-medium">
              {t("popularCategories")}
            </h5>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={() => api && api.scrollTo(current - 1)}
                className={`bg-primary p-1 sm:p-2 rounded-full ${
                  !api?.canScrollPrev() ? "opacity-65 cursor-default" : ""
                }`}
                disabled={!api?.canScrollPrev()}
              >
                <ArrowLeftIcon
                  size={24}
                  weight="bold"
                  color="white"
                  className={isRTL ? "rotate-180" : ""}
                />
              </button>
              <button
                onClick={handleNext}
                className={`bg-primary p-1 sm:p-2 rounded-full ${
                  isNextDisabled ? "opacity-65 cursor-default" : ""
                }`}
                disabled={isNextDisabled}
              >
                <ArrowRightIcon
                  size={24}
                  weight="bold"
                  color="white"
                  className={isRTL ? "rotate-180" : ""}
                />
              </button>
            </div>
          </div>

          <Carousel
            key={isRTL ? "rtl" : "ltr"}
            className="w-full mt-6"
            setApi={setApi}
            opts={{
              align: "start",
              containScroll: "trim",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <CarouselContent className="-ml-3 md:-ml-7.5">
              {cateData.map((item) => (
                <CarouselItem
                  key={item?.id}
                  className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-[16.66%] xl:basis-[12.5%] 2xl:basis-[11.11%] md:pl-7.5"
                >
                  <PopularCategoryCard
                    item={item}
                    onCategoryClick={setSelectedCategory}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        {/* Opens when a category with subcategories is clicked */}
        <SubcategoryModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      </>
    )
  );
};

export default PopularCategories;
