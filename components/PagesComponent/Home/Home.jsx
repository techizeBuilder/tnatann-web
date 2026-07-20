"use client";
import { useEffect, useMemo, useState } from "react";
import AllItems from "./AllItems";
import FeaturedSections from "./FeaturedSections";
import { FeaturedSectionApi, getBannerAdsApi, sliderApi } from "@/utils/api";
import OfferSliderSkeleton from "@/components/PagesComponent/Home/OfferSliderSkeleton";
import FeaturedSectionsSkeleton from "./FeaturedSectionsSkeleton";
import PopularCategories from "./PopularCategories";
import { useSelector } from "react-redux";
import { getHomeScreenSections } from "@/redux/reducer/settingSlice";
import { getCityData, getKilometerRange } from "@/redux/reducer/locationSlice";
import { useParams } from "next/navigation";
import OfferSlider from "./OfferSlider";
import AdUnit from "@/components/AdSense/AdUnit";
import SectionBanners from "@/components/CustomBanners/SectionBanners";
import ExploreVideos from "./ExploreVideos";


const Home = () => {
  const KmRange = useSelector(getKilometerRange);
  const cityData = useSelector(getCityData);
  const sections = useSelector(getHomeScreenSections);
  const { lang: langCode } = useParams();
  const [IsFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [featuredData, setFeaturedData] = useState([]);
  const [Slider, setSlider] = useState([]);
  const [IsSliderLoading, setIsSliderLoading] = useState(true);
  const [bannerAds, setBannerAds] = useState([]);

  // single pass — keyed by "sectionType_placement", API already sorted by position
  // each item is either a banner object (single) or [banner, banner] (dual pair)
  const bannerMap = useMemo(() => {
    if (!sections?.length || !bannerAds?.length) return {};
    const sectionById = {};
    for (const section of sections) {
      sectionById[section.id] = section.section_type;
    }
    const grouped = {};
    for (const item of bannerAds) {
      const banner = Array.isArray(item) ? item[0] : item;
      if (!banner?.status) continue;
      let key;
      if (banner.feature_section_id) {
        key = "feature_" + banner.feature_section_id + "_" + banner.placement;
      } else {
        const sectionType = sectionById[banner.home_screen_section_id];
        if (!sectionType) continue;
        key = sectionType + "_" + banner.placement;
      }
      (grouped[key] ||= []).push(item);
    }
    return grouped;
  }, [sections, bannerAds]);

  const allEmpty = useMemo(
    () => featuredData?.every((ele) => ele?.section_data.length === 0),
    [featuredData]
  );

  // null = API failed, show all sections as fallback
  const hasSection = (type) =>
    !sections || sections.some((s) => s.section_type === type);

  useEffect(() => {
    if (!hasSection("slider")) return;
    const fetchSliderData = async () => {
      let params = {};
      if (cityData?.city) {
        params.city = cityData.city;
        params.state = cityData.state;
        params.country = cityData.country;
      } else if (cityData?.state) {
        params.state = cityData.state;
      } else if (cityData?.country) {
        params.country = cityData.country;
      }
      try {
        const response = await sliderApi.getSlider(params);
        const data = response.data;
        setSlider(data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSliderLoading(false);
      }
    };
    fetchSliderData();
  }, [cityData?.city, cityData?.state, cityData?.country]);

  useEffect(() => {
    if (!hasSection("featured_section")) return;
    const fetchFeaturedSectionData = async () => {
      setIsFeaturedLoading(true);
      try {
        const params = {};
        if (Number(KmRange) > 0 && (cityData?.areaId || cityData?.city)) {
          params.radius = KmRange;
          params.latitude = cityData.lat;
          params.longitude = cityData.long;
        } else {
          if (cityData?.areaId) {
            params.area_id = cityData.areaId;
          } else if (cityData?.city) {
            params.city = cityData.city;
          } else if (cityData?.state) {
            params.state = cityData.state;
          } else if (cityData?.country) {
            params.country = cityData.country;
          }
        }
        const response = await FeaturedSectionApi.getFeaturedSections(params);
        const { data } = response.data;
        setFeaturedData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsFeaturedLoading(false);
      }
    };
    fetchFeaturedSectionData();
  }, [
    cityData.lat, cityData.long, KmRange, langCode,
  ]);

  useEffect(() => {
    const getBannerAds = async () => {
      try {
        const response = await getBannerAdsApi.getBannerAds({ page: "home" });
        setBannerAds(response.data.data ?? []);
      } catch (error) {
        console.error("Error fetching banner ads:", error);
      }
    }
    getBannerAds();
  }, [])

  return (
    <div className="flow-root">
      {hasSection("slider") && (
        IsSliderLoading ? (
          <OfferSliderSkeleton />
        ) : (
          Slider.length > 0 && (
            <OfferSlider
              Slider={Slider}
              aboveBanners={bannerMap["slider_above"]}
              belowBanners={bannerMap["slider_below"]}
            />
          )
        )
      )}
      {hasSection("popular_categories") && (
        <>
          <SectionBanners banners={bannerMap["popular_categories_above"]} className="container mb-6 sm:mb-12" />
          <PopularCategories />
          <SectionBanners banners={bannerMap["popular_categories_below"]} className="container mt-6 sm:mt-12" />
          <ExploreVideos />
        </>
      )}
      <div className="container">
        <AdUnit type="banner" className="mt-12" />
      </div>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
          <div className="lg:col-span-12">
            {hasSection("featured_section") && (
              <>
                <SectionBanners banners={bannerMap["featured_section_above"]} className="mb-6 sm:mb-12" />
                {IsFeaturedLoading ? (
                  <FeaturedSectionsSkeleton />
                ) : (
                  !allEmpty &&
                  <FeaturedSections
                    featuredData={featuredData}
                    setFeaturedData={setFeaturedData}
                    bannerMap={bannerMap}
                  />
                )}
                <SectionBanners banners={bannerMap["featured_section_below"]} className="mt-6 sm:mt-12" />
              </>
            )}
            {hasSection("all_ads") && <AllItems cityData={cityData} KmRange={KmRange} aboveBanners={bannerMap["all_ads_above"]} belowBanners={bannerMap["all_ads_below"]} />}
          </div>
        </div>
        <AdUnit type="banner" className="mt-12" />
      </div>
    </div>
  );
};

export default Home;
