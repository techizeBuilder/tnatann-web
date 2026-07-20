"use client";
import useGetCategories from "@/components/Layout/useGetCategories";
import { categoryApi } from "@/utils/api";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { getIsRtl } from "@/redux/reducer/languageSlice";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import AdsCategoryCarouselSkeleton from "./AdsCategoryCarouselSkeleton";
import PopularCategoryCard from "../Home/PopularCategoryCard";

const AdsCategoryCarousel = ({ title, leafSlug }) => {
    const { lang: langCode, categorySlug } = useParams();
    const slugPrefix = categorySlug ? categorySlug.join("/") : null;
    const isRTL = useSelector(getIsRtl);
    const [api, setApi] = useState();
    const [, setScrollSnap] = useState(0);

    // Root categories — Redux cached, always fetched once globally
    const { isCatLoading, cateData, isCatLoadMore, catLastPage, catCurrentPage, getCategories } = useGetCategories();

    // Subcategory state — local, per leafSlug
    const [subState, setSubState] = useState({
        items: [],
        isLoading: false,
        isLoadMore: false,
        currentPage: 1,
        lastPage: 1,
    });

    useEffect(() => {
        if (!api) return;
        const update = () => setScrollSnap(api.selectedScrollSnap());
        update();
        api.on("select", update);
        api.on("reInit", update);
    }, [api]);

    useEffect(() => {
        if (leafSlug) fetchSubCategories(1);
    }, [leafSlug, langCode]);

    const fetchSubCategories = async (page) => {
        setSubState((prev) => ({
            ...prev,
            ...(page === 1 ? { isLoading: true, items: [] } : { isLoadMore: true }),
        }));
        try {
            const res = await categoryApi.getCategory({ slug: leafSlug, page });
            if (res?.data?.error === false) {
                const data = res?.data?.data?.data || [];
                setSubState((prev) => ({
                    items: page === 1 ? data : [...prev.items, ...data],
                    isLoading: false,
                    isLoadMore: false,
                    currentPage: res?.data?.data?.current_page ?? 1,
                    lastPage: res?.data?.data?.last_page ?? 1,
                }));
            }
        } catch (error) {
            console.log(error);
            setSubState((prev) => ({ ...prev, isLoading: false, isLoadMore: false }));
        }
    };

    // Pick active data source based on leafSlug
    const isLoading = leafSlug ? subState.isLoading : isCatLoading;
    const items = leafSlug ? subState.items : cateData;
    const isLoadMore = leafSlug ? subState.isLoadMore : isCatLoadMore;
    const currentPage = leafSlug ? subState.currentPage : catCurrentPage;
    const lastPage = leafSlug ? subState.lastPage : catLastPage;

    const isNextDisabled = isLoadMore || (!api?.canScrollNext() && currentPage >= lastPage);

    const handleNext = async () => {
        if (api?.canScrollNext()) {
            api.scrollNext();
            return;
        }
        if (currentPage < lastPage) {
            leafSlug
                ? await fetchSubCategories(currentPage + 1)
                : await getCategories(currentPage + 1);
            setTimeout(() => api?.scrollNext(), 200);
        }
    };

    const carouselItems = useMemo(() =>
        items.map((item) => (
            <CarouselItem
                key={item?.id}
                className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/4 xl:basis-[16.66%] 2xl:basis-[12.5%] md:pl-7.5"
            >
                <PopularCategoryCard item={item} useHeaderLocation={false} slugPrefix={slugPrefix} />
            </CarouselItem>
        )),
        [items]
    );

    if (isLoading) return <AdsCategoryCarouselSkeleton />;

    return (
        <>
            <div className="space-between">
                <h1 className="text-2xl font-semibold break-all">{title}</h1>
                {items.length > 0 && (
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                        <button
                            onClick={() => api?.scrollPrev()}
                            className={`bg-primary p-1 sm:p-2 rounded-full ${!api?.canScrollPrev() ? "opacity-65 cursor-default" : ""}`}
                            disabled={!api?.canScrollPrev() ?? true}
                        >
                            <ArrowLeftIcon size={24} color="white" className={isRTL ? "rotate-180" : ""} />
                        </button>
                        <button
                            onClick={handleNext}
                            className={`bg-primary p-1 sm:p-2 rounded-full ${isNextDisabled ? "opacity-65 cursor-default" : ""}`}
                            disabled={isNextDisabled}
                        >
                            {isLoadMore
                                ? <CircleNotchIcon size={24} className="animate-spin" weight="bold" />
                                : <ArrowRightIcon size={24} color="white" className={isRTL ? "rotate-180" : ""} />
                            }
                        </button>
                    </div>
                )}
            </div>
            {items.length > 0 && (
                <Carousel
                    key={isRTL ? "rtl" : "ltr"}
                    className="w-full mt-6"
                    setApi={setApi}
                    opts={{ align: "start", containScroll: "trim", direction: isRTL ? "rtl" : "ltr" }}
                >
                    <CarouselContent className="-ml-3 md:-ml-7.5">
                        {carouselItems}
                    </CarouselContent>
                </Carousel>
            )}
        </>
    );
};

export default AdsCategoryCarousel;
