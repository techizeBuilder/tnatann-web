"use client";
import { useEffect, useMemo, useState } from "react";
import Filter from "../../Filter/Filter";
import {
  allItemApi,
  FeaturedSectionApi,
  getCustomFieldsApi,
  getParentCategoriesApi,
  getSeoSettingsApi,
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
import { TbTransferVertical } from "react-icons/tb";
import { IoGrid } from "react-icons/io5";
import { CiGrid2H } from "react-icons/ci";

import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import Layout from "@/components/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import {
  BreadcrumbPathData,
  setBreadcrumbPath,
} from "@/redux/reducer/breadCrumbSlice";
import { getLanguageInfo } from "@/redux/reducer/settingSlice";
import { seoData, t } from "@/utils";
import AdVertical from "@/components/AdSense/AdVertical";
import AdFooterBanner from "@/components/AdSense/AdFooterBanner";
import { useTranslateLocationInUrl } from "@/components/Location/useTranslateLocationInUrl";
import AdBanner from "@/components/AdSense/AdBanner";
import ActiveFilters from "@/components/Filter/ActiveFilters";
import { useAdsFilters } from "@/components/Hooks/useAdsFilters";
import { useParams } from "next/navigation";
import { getKeywords } from "@/lib/seoApi";
import useSkipFirstLoad from "@/components/Hooks/useSkipFirstLoad";

const Ads = () => {
  const isFirstLoad = useSkipFirstLoad();
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

  const { lang: langCode } = useParams();
  const { supportedLangs, defaultLangCode } = useSelector(getLanguageInfo);

  const {
    query, slug, country, state, city, areaId, lat, lng,
    min_price, max_price, date_posted, sortBy, km_range, featured_section,
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
  const [extraDetails, setExtraDetails] = useState(initialExtraDetails);

  useEffect(() => {
    const fetchFeaturedSectionData = async () => {
      try {
        const response = await FeaturedSectionApi.getFeaturedSections({
          slug: featured_section,
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
    if (featured_section) {
      fetchFeaturedSectionData();
    }
  }, [langCode, featured_section]);

  useEffect(() => {
    if (slug) {
      constructBreadcrumbPath();
    } else {
      dispatch(
        setBreadcrumbPath([
          {
            name: t("allCategories"),
            key: "all-categories",
            slug: "/ads",
            isAllCategories: true,
          },
        ])
      );
      setCustomFields([]);
      setExtraDetails({});
      if (!isFirstLoad) {
        const fetchSeoSettings = async () => {
          const res = await getSeoSettingsApi.getSeoSettings({
            page: "ad-listing",
          });
          const data = res.data.data[0];

          const title =
            data?.translated_title ||
            data?.title ||
            process.env.NEXT_PUBLIC_META_TITLE;
          const description =
            data?.translated_description ||
            process.env.NEXT_PUBLIC_META_DESCRIPTION;
          const keywords =
            data?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS;
          const image = data?.image || "";
          const schema = data?.translated_schema || null;

          seoData({
            seo: {
              title,
              description,
              keywords,
              image,
              schema
            },
            url: {
              baseUrl: process.env.NEXT_PUBLIC_WEB_URL,
              langCode,
              path: "ads",
              paramsStr: "",
              supportedLangs,
              defaultLangCode,
            },
          });
        };
        fetchSeoSettings();
      }
    }
  }, [slug, langCode]);

  const getCustomFieldsData = async (categoryId) => {
    try {
      const res = await getCustomFieldsApi.getCustomFields({
        category_id: categoryId,
        filter: true,
      });
      const data = res?.data?.data;
      setCustomFields(data);
      const isShowCustomfieldFilter =
        data.length > 0 &&
        data.some(
          (field) =>
            field.type === "checkbox" ||
            field.type === "radio" ||
            field.type === "dropdown"
        );

      if (isShowCustomfieldFilter) {
        const initialExtraDetails = {};
        data.forEach((field) => {
          const value = searchParams.get(field.id);
          if (value) {
            initialExtraDetails[field.id] =
              field.type === "checkbox" ? value.split(",") : value;
          }
        });
        setExtraDetails(initialExtraDetails);
      } else {
        setExtraDetails({});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const constructBreadcrumbPath = async () => {
    try {
      const res = await getParentCategoriesApi.getPaymentCategories({
        slug,
        tree: 0,
      });
      const data = res?.data?.data || [];
      const selectedCategory = data?.at(-1);
      if (selectedCategory && !isFirstLoad) {
        seoData({
          seo: {
            title:
              selectedCategory?.seo_detail?.translated_meta_title || process.env.NEXT_PUBLIC_META_TITLE,
            description:
              selectedCategory?.seo_detail?.translated_meta_description ||
              process.env.NEXT_PUBLIC_META_DESCRIPTION,
            keywords:
              getKeywords(selectedCategory?.seo_detail?.translated_meta_keywords) ||
              process.env.NEXT_PUBLIC_META_kEYWORDS,
            image: selectedCategory?.image,
            schema: selectedCategory?.seo_detail?.translated_schema || null,
          },
          url: {
            baseUrl: process.env.NEXT_PUBLIC_WEB_URL,
            langCode,
            path: "ads",
            paramsStr: `category=${selectedCategory?.slug}`,
            supportedLangs,
            defaultLangCode,
          },
        });
      }
      const breadcrumbArray = [
        {
          name: t("allCategories"),
          key: "all-categories",
          slug: "/ads",
          isAllCategories: true,
        },
        ...data.map((item) => ({
          name: item.translated_name,
          key: item.slug,
          slug: `/ads?category=${item.slug}`,
        })),
      ];
      dispatch(setBreadcrumbPath(breadcrumbArray));
      const lastCategoryId = data.at(-1)?.id;
      await getCustomFieldsData(lastCategoryId);
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
    slug,
    query,
    langCode,
    featured_section,
  ]);

  const getSingleCatItem = async (page) => {
    try {
      const parameters = { page, limit: 12 };
      if (sortBy) parameters.sort_by = sortBy;
      if (isMinPrice) parameters.min_price = min_price;
      if (max_price) parameters.max_price = max_price;
      if (date_posted) parameters.posted_since = date_posted;
      if (slug) parameters.category_slug = slug;
      if (extraDetails) parameters.custom_fields = extraDetails;
      if (featured_section) parameters.featured_section_slug = featured_section;

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

  const handleProdLoadMore = async () => {
    setAdvertisements((prev) => ({ ...prev, isLoadMore: true }));
    await getSingleCatItem(advertisements.currentPage + 1);
  };

  const handleSortBy = (value) => {
    newSearchParams.set("sort_by", value);
    window.history.pushState(null, "", `/${langCode}/ads?${newSearchParams.toString()}`);
  };

  const handleLike = (id) => {
    const updatedItems = advertisements.data.map((item) => {
      if (item.id === id) {
        return { ...item, is_liked: !item.is_liked };
      }
      return item;
    });
    setAdvertisements((prev) => ({ ...prev, data: updatedItems }));
  };

  return (
    <Layout>
      <BreadCrumb />
      <div className="container mt-8">
        <div className="flex flex-col">

          <AdBanner className='mb-6' />

          <h1 className="text-2xl font-semibold mb-6 break-all">{title}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="xl:col-span-3 lg:col-span-4 col-span-1">
              <Filter
                customFields={customFields}
                extraDetails={extraDetails}
                setExtraDetails={setExtraDetails}
                newSearchParams={newSearchParams}
              />
              <AdVertical className="mt-8" />
            </div>
            <div className="xl:col-span-9 lg:col-span-8 col-span-1 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex flex-col md:flex-row  items-start md:items-center gap-2">
                    <div className="hidden md:flex gap-2 items-center whitespace-nowrap">
                      <TbTransferVertical />
                      {t("sortBy")}
                    </div>
                    <Select value={sortBy} onValueChange={handleSortBy}>
                      <SelectTrigger className="max-w-45 font-semibold">
                        <SelectValue
                          placeholder={t("sortBy")}
                          className="font-semibold"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className="font-semibold">
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
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setView("list")}
                    className={`text-muted-foreground p-2 sm:p-3 rounded-full ${view === "list" ? "bg-primary text-white" : ""
                      }`}
                  >
                    <CiGrid2H className="size-4 sm:size-5" />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={` text-muted-foreground p-2   sm:p-3 rounded-full  ${view === "grid" ? "bg-primary text-white" : ""
                      }`}
                  >
                    <IoGrid className="size-4 sm:size-5" />
                  </button>
                </div>
              </div>

              {/* Active Filter Badges */}
              <ActiveFilters
                customFields={customFields}
                extraDetails={extraDetails}
                setExtraDetails={setExtraDetails}
                featuredTitle={featuredTitle}
              />

              <AdsGrid
                advertisements={advertisements}
                view={view}
                handleLike={handleLike}
                handleProdLoadMore={handleProdLoadMore}
              />
              <div>
                <AdFooterBanner />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Ads;
