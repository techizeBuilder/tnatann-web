"use client";
import { useEffect, useMemo, useState } from "react";
import Filter from "../../Filter/Filter";
import {
  allItemApi,
  FeaturedSectionApi,
  getBannerAdsApi,
  getCustomFieldsApi,
  getParentCategoriesApi,
} from "@/utils/api";
import AdsGrid from "./AdsGrid";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowsDownUpIcon, SquaresFourIcon, RowsIcon } from "@phosphor-icons/react";

import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useDispatch, useSelector } from "react-redux";
import {
  BreadcrumbPathData,
  setBreadcrumbPath,
} from "@/redux/reducer/breadCrumbSlice";
import { t } from "@/utils";
import { useTranslateLocationInUrl } from "@/components/Location/useTranslateLocationInUrl";
import ActiveFilters from "@/components/Filter/ActiveFilters";
import { useAdsFilters } from "@/components/Hooks/useAdsFilters";
import { useParams } from "next/navigation";
import { useNavigate } from "@/components/Hooks/useNavigate";
import AdsCategoryCarousel from "./AdsCategoryCarousel";
import AdUnit from "@/components/AdSense/AdUnit";
import SectionBanners from "@/components/CustomBanners/SectionBanners";

const Ads = ({ featuredSlug }) => {
  const dispatch = useDispatch();
  const BreadcrumbPath = useSelector(BreadcrumbPathData);
  const [view, setView] = useState("grid");
  const [advertisements, setAdvertisements] = useState({
    data: [],
    currentPage: 1,
    hasMore: false,
    isLoading: false,
    isLoadMore: false,
  });
  useTranslateLocationInUrl();
  const [featuredTitle, setFeaturedTitle] = useState("");
  const [bannerAds, setBannerAds] = useState([]);

  const bannerMap = useMemo(() => {
    if (!bannerAds?.length) return {};
    const grouped = {};
    for (const item of bannerAds) {
      const banner = Array.isArray(item) ? item[0] : item;
      if (!banner?.status || !banner.listing_page_section) continue;

      // side layouts have no placement — always sidebar, key by section + "_side"
      // others key by section + placement (above/below)
      const isSideLayout = banner.layout === "single_side" || banner.layout === "dual_side";
      const key = isSideLayout
        ? banner.listing_page_section + "_side"
        : banner.listing_page_section + "_" + banner.placement;

      (grouped[key] ||= []).push(item);
    }
    return grouped;
  }, [bannerAds]);

  const { lang: langCode, categorySlug } = useParams();
  const leafSlug = categorySlug?.at(-1) ?? null;
  const { pushState } = useNavigate();

  const {
    query, country, state, city, areaId, lat, lng,
    min_price, max_price, date_posted, sortBy, km_range,
    initialExtraDetails, searchParams
  } = useAdsFilters();


  const newSearchParams = new URLSearchParams(searchParams);

  const isMinPrice =
    min_price !== "" &&
    min_price !== null &&
    min_price !== undefined &&
    min_price >= 0;

  const title = useMemo(() => {
    if (BreadcrumbPath.length === 2) {
      return BreadcrumbPath[1]?.name;
    }

    if (BreadcrumbPath.length > 2) {
      const last = BreadcrumbPath[BreadcrumbPath.length - 1]?.name;
      const secondLast = BreadcrumbPath[BreadcrumbPath.length - 2]?.name;
      return `${last} ${t("in")} ${secondLast}`;
    }

    return t("ads");
  }, [BreadcrumbPath, t]);

  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const fetchFeaturedSectionData = async () => {
      try {
        const response = await FeaturedSectionApi.getFeaturedSections({
          slug: featuredSlug,
        });
        if (response?.data?.error === false) {
          setFeaturedTitle(
            response?.data?.data?.[0]?.translated_name ||
            response?.data?.data?.[0]?.title
          );
        } else {
          console.error(response?.data?.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    if (featuredSlug) {
      fetchFeaturedSectionData();
    }
  }, [langCode, featuredSlug]);

  useEffect(() => {
    if (leafSlug) {
      constructBreadcrumbPath(leafSlug);
    } else {
      dispatch(
        setBreadcrumbPath([
          {
            name: t("ads"),
            key: "all-categories",
            slug: "/ads",
            isAllCategories: true,
          },
        ])
      );
      setCustomFields([]);
    }
  }, [leafSlug, langCode]);

  const getCustomFieldsData = async (categoryId) => {
    try {
      const res = await getCustomFieldsApi.getCustomFields({
        category_id: categoryId,
        filter: true,
      });
      const data = res?.data?.data;
      setCustomFields(data);
    } catch (error) {
      console.log(error);
    }
  };

  const constructBreadcrumbPath = async (slug) => {
    try {
      const res = await getParentCategoriesApi.getPaymentCategories({
        slug,
        tree: 0,
      });
      const data = res?.data?.data || [];
      const breadcrumbArray = [
        {
          name: t("ads"),
          key: "all-categories",
          slug: "/ads",
          isAllCategories: true,
        },
        ...data.map((item, index) => ({
          name: item.translated_name,
          key: item.slug,
          slug: `/ads/${data.slice(0, index + 1).map((d) => d.slug).join("/")}`,
        })),
      ];
      dispatch(setBreadcrumbPath(breadcrumbArray));
      await getCustomFieldsData(data.at(-1)?.id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleCatItem(1);
  }, [
    lat,
    lng,
    areaId,
    city,
    state,
    country,
    min_price,
    max_price,
    date_posted,
    km_range,
    sortBy,
    initialExtraDetails,
    query,
    langCode,
    featuredSlug,
    leafSlug,
  ]);

  const getSingleCatItem = async (page) => {
    try {
      const parameters = { page, limit: 12 };
      if (sortBy && sortBy !== "default") parameters.sort_by = sortBy;
      if (isMinPrice) parameters.min_price = min_price;
      if (max_price) parameters.max_price = max_price;
      if (date_posted) parameters.posted_since = date_posted;
      if (leafSlug) parameters.category_slug = leafSlug;
      if (initialExtraDetails) parameters.custom_fields = initialExtraDetails;
      if (featuredSlug) parameters.featured_section_slug = featuredSlug;

      if (Number(km_range) > 0) {
        parameters.latitude = lat;
        parameters.longitude = lng;
        parameters.radius = km_range;
      } else {
        if (areaId) {
          parameters.area_id = areaId;
        } else if (city) {
          parameters.city = city;
        } else if (state) {
          parameters.state = state;
        } else if (country) {
          parameters.country = country;
        }
      }
      if (query) {
        parameters.search = query;
      }
      page === 1
        ? setAdvertisements((prev) => ({ ...prev, isLoading: true }))
        : setAdvertisements((prev) => ({ ...prev, isLoadMore: true }));

      const res = await allItemApi.getItems(parameters);
      const data = res?.data;

      if (data.error === false) {
        page > 1
          ? setAdvertisements((prev) => ({
            ...prev,
            data: [...prev.data, ...data?.data?.data],
            currentPage: data?.data?.current_page,
            hasMore: data?.data?.last_page > data?.data?.current_page,
          }))
          : setAdvertisements((prev) => ({
            ...prev,
            data: data?.data?.data,
            currentPage: data?.data?.current_page,
            hasMore: data?.data?.last_page > data?.data?.current_page,
          }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAdvertisements((prev) => ({
        ...prev,
        isLoading: false,
        isLoadMore: false,
      }));
    }
  };

  useEffect(() => {
    const getBannerAds = async () => {
      try {
        const response = await getBannerAdsApi.getBannerAds({ page: "listing" });
        setBannerAds(response.data.data ?? []);
      } catch (error) {
        console.error("Error fetching banner ads:", error);
      }
    }
    getBannerAds();
  }, [])


  const handleProdLoadMore = async () => {
    setAdvertisements((prev) => ({ ...prev, isLoadMore: true }));
    await getSingleCatItem(advertisements.currentPage + 1);
  };

  const categoryPath = categorySlug ? `/${categorySlug.join("/")}` : "";

  const handleSortBy = (value) => {
    newSearchParams.set("sort_by", value);
    const basePath = featuredSlug ? `/ads/featured/${featuredSlug}` : `/ads${categoryPath}`;
    pushState(`${basePath}?${newSearchParams.toString()}`);
  };

  const handleLike = (id, liked) => {
    setAdvertisements((prev) => ({
      ...prev,
      data: prev.data.map((item) => (item.id === id ? { ...item, is_liked: liked } : item)),
    }));
  };

  return (
    <>
      <BreadCrumb title2={featuredSlug ? (featuredTitle || featuredSlug) : undefined} />
      <div className="container mt-8">
        <div className="flex flex-col">
          <SectionBanners banners={bannerMap["category_list_above"]} className="mb-6" />
          <AdUnit type="banner" className='mb-6' />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="xl:col-span-3 lg:col-span-4 col-span-1">
              <Filter
                customFields={customFields}
                newSearchParams={newSearchParams}
              />
              <div className="hidden lg:block sticky top-4 mt-8">
                <SectionBanners banners={bannerMap["listing_data_side"]} />
              </div>
              <AdUnit type="square" className="mt-8 aspect-square" />
            </div>
            <div className="xl:col-span-9 lg:col-span-8 col-span-1 flex flex-col gap-6">
              {featuredSlug
                ? <h1 className="text-2xl font-semibold break-all">{featuredTitle || featuredSlug}</h1>
                : <AdsCategoryCarousel title={title} leafSlug={leafSlug} />
              }
              <SectionBanners banners={bannerMap["category_list_below"]} />
              <div className="flex justify-between items-center">
                <div className="flex flex-col md:flex-row  items-start md:items-center gap-2">
                  <div className="hidden md:flex gap-2 items-center whitespace-nowrap">
                    <ArrowsDownUpIcon weight="bold" />
                    {t("sortBy")}
                  </div>
                  <Select value={sortBy} onValueChange={handleSortBy}>
                    <SelectTrigger className="font-semibold">
                      <SelectValue
                        placeholder={t("sortBy")}
                        className="font-semibold"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="font-semibold">
                        <SelectItem value="default">
                          {t("default")}
                        </SelectItem>
                        <SelectItem value="new-to-old">
                          {t("newestToOldest")}
                        </SelectItem>
                        <SelectItem value="old-to-new">
                          {t("oldestToNewest")}
                        </SelectItem>
                        <SelectItem value="price-high-to-low">
                          {t("priceHighToLow")}
                        </SelectItem>
                        <SelectItem value="price-low-to-high">
                          {t("priceLowToHigh")}
                        </SelectItem>
                        <SelectItem value="popular_items">
                          {t("popular")}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setView("list")}
                    className={`text-muted-foreground p-2 sm:p-3 rounded-full ${view === "list" ? "bg-primary text-white" : ""
                      }`}
                  >
                    <RowsIcon className="size-4 sm:size-5" weight={view === "list" ? "fill" : "regular"} />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={` text-muted-foreground p-2 sm:p-3 rounded-full  ${view === "grid" ? "bg-primary text-white" : ""
                      }`}
                  >
                    <SquaresFourIcon className="size-4 sm:size-5" weight={view === "grid" ? "fill" : "regular"} />
                  </button>
                </div>
              </div>

              {/* Active Filter Badges */}
              <ActiveFilters
                customFields={customFields}
              />

              <AdsGrid
                advertisements={advertisements}
                view={view}
                handleLike={handleLike}
                handleProdLoadMore={handleProdLoadMore}
              />
            </div>
          </div>
          <SectionBanners banners={bannerMap["listing_data_below"]} className="mt-6 sm:mt-12" />
          <AdUnit type="banner" />
        </div>
      </div>
    </>
  );
};

export default Ads;