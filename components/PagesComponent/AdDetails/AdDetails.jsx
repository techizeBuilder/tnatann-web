"use client";
import { useEffect, useMemo, useState } from "react";
import { allItemApi, getBannerAdsApi, getMyItemsApi, getMyReelsApi, getReelsApi, setItemTotalClickApi } from "@/utils/api";
import AdFeature from "./AdFeature";
import AdDescription from "./AdDescription";
import RelatedSearches from "./RelatedSearches";
import AdDetailCard from "./AdDetailCard";
import SellerDetailCard from "./SellerDetailCard";
import AdLocation from "./AdLocation";
import AdsReportCard from "./AdsReportCard";
import SimilarAds from "./SimilarAds";
import MyAdsListingDetailCard from "./MyAdsListingDetailCard";
import AdsStatusChangeCards from "./AdsStatusChangeCards";
import { usePathname } from "next/navigation";
import AdGallery from "./AdGallery";
import {
  getFilteredCustomFields,
  getYouTubeVideoId,
  t,
  truncate,
} from "@/utils";
import PageLoader from "@/components/Common/PageLoader";
import OpenInAppDrawer from "@/components/Common/OpenInAppDrawer";
import { useDispatch, useSelector } from "react-redux";
import { CurrentLanguageData } from "@/redux/reducer/languageSlice";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { setBreadcrumbPath } from "@/redux/reducer/breadCrumbSlice";
import MakeFeaturedAd from "./MakeFeaturedAd";
import RenewAd from "./RenewAd";
import AdEditedByAdmin from "./AdEditedByAdmin";
import NoData from "@/components/EmptyStates/NoData";
import AdUnit from "@/components/AdSense/AdUnit";
import SectionBanners from "@/components/CustomBanners/SectionBanners";

const AdDetails = ({ slug, langCode }) => {
  const CurrentLanguage = useSelector(CurrentLanguageData);
  const dispatch = useDispatch();
  const pathName = usePathname();
  const isMyListing = pathName?.includes("/my-listing") ? true : false;
  const [productDetails, setProductDetails] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [status, setStatus] = useState("");
  const [videoData, setVideoData] = useState({
    url: "",
    thumbnail: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenInApp, setIsOpenInApp] = useState(false);
  const [bannerAds, setBannerAds] = useState([]);
  const [reelData, setReelData] = useState(null)

  const bannerMap = useMemo(() => {
    if (!bannerAds?.length) return {};
    const grouped = {};
    for (const item of bannerAds) {
      const banner = Array.isArray(item) ? item[0] : item;
      if (!banner?.status || !banner.detail_page_section) continue;
      const isSideLayout = banner.layout === "single_side" || banner.layout === "dual_side";
      const key = isSideLayout
        ? banner.detail_page_section + "_side"
        : banner.detail_page_section + "_" + banner.placement;
      (grouped[key] ||= []).push(item);
    }
    return grouped;
  }, [bannerAds]);

  const IsShowFeaturedAd =
    isMyListing &&
    !productDetails?.is_feature &&
    productDetails?.status === "approved";

  const isMyAdExpired = isMyListing && productDetails?.status === "expired";
  const isEditedByAdmin =
    isMyListing && productDetails?.is_edited_by_admin === 1;

  useEffect(() => {
    fetchProductDetails();
  }, [langCode]);

  useEffect(() => {
    if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) && !isMyListing) {
      setIsOpenInApp(true);
    }
  }, []);

  useEffect(() => {
    const getBannerAds = async () => {
      try {
        const response = await getBannerAdsApi.getBannerAds({ page: "detail" });
        setBannerAds(response.data.data ?? []);
      } catch (error) {
        console.error("Error fetching banner ads:", error);
      }
    }
    getBannerAds();
  }, [])

  const fetchReelData = async (product) => {
    if (product?.item_type !== "reel") return;
    const reelRes = isMyListing
      ? await getMyReelsApi.getMyReels({ item_id: product?.id })
      : await getReelsApi.getReels({ item_id: product?.id });
    if (reelRes?.data?.error === false) {
      setReelData(reelRes?.data?.data?.data?.[0]);
    }
  };

  const fetchMyListingDetails = async (slug) => {
    const response = await getMyItemsApi.getMyItems({ slug });
    const product = response?.data?.data?.data?.[0];
    if (!product) throw new Error("My listing product not found");
    setProductDetails(product);
    if (product?.item_video?.video_type === "file" && product?.item_video?.video_file) {
      setVideoData({ url: product.item_video.video_file, thumbnail: "" });
    } else if (product?.item_video?.video_link) {
      const videoId = getYouTubeVideoId(product.item_video.video_link);
      const thumbnail = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "";
      setVideoData({ url: product.item_video.video_link, thumbnail });
    }
    await fetchReelData(product);
    setGalleryImages(product?.gallery_images);
    setStatus(product?.status);
    dispatch(
      setBreadcrumbPath([
        {
          name: t("myAds"),
          slug: "/my-ads",
        },
        {
          name: truncate(product?.translated_item?.name || product?.name, 80),
        },
      ])
    );
  };

  const incrementViews = async (item_id) => {
    try {
      if (!item_id) {
        console.error("Invalid item_id for incrementViews");
        return;
      }
      const res = await setItemTotalClickApi.setItemTotalClick({ item_id });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const fetchPublicListingDetails = async (slug) => {
    const response = await allItemApi.getItems({ slug });
    const product = response?.data?.data?.data?.[0];

    if (!product) throw new Error("Public listing product not found");
    setProductDetails(product);
    if (product?.item_video?.video_type === "file" && product?.item_video?.video_file) {
      setVideoData({ url: product.item_video.video_file, thumbnail: "" });
    } else if (product?.item_video?.video_link) {
      const videoId = getYouTubeVideoId(product.item_video.video_link);
      const thumbnail = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "";
      setVideoData({ url: product.item_video.video_link, thumbnail });
    }
    await fetchReelData(product);
    setGalleryImages(product?.gallery_images);
    await incrementViews(product?.id);
  };

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      if (isMyListing) {
        await fetchMyListingDetails(slug);
      } else {
        await fetchPublicListingDetails(slug);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      // You can also show a toast or error message here
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFields = getFilteredCustomFields(
    productDetails?.all_translated_custom_fields,
    CurrentLanguage?.id
  );

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : productDetails ? (
        <>
          {isMyListing ? (
            <BreadCrumb />
          ) : (
            <BreadCrumb
              title2={truncate(
                productDetails?.translated_item?.name || productDetails?.name,
                80
              )}
            />
          )}
          <div className="container mt-8">
            <div className="flex flex-col gap-6">
              <SectionBanners banners={bannerMap["ad_info_above"]} />
              <AdUnit type='banner' />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mt-6">
              <div className="col-span-1 lg:col-span-8">
                <div className="flex flex-col gap-7">
                  <AdGallery
                    galleryImages={galleryImages}
                    videoData={videoData}
                    reelThumbnail={reelData?.thumbnail}
                    reelId={reelData?.id}
                    isOwner={isMyListing}
                  />

                  {IsShowFeaturedAd && (
                    <MakeFeaturedAd
                      item_id={productDetails?.id}
                      setProductDetails={setProductDetails}
                    />
                  )}

                  {filteredFields.length > 0 && (
                    <AdFeature filteredFields={filteredFields} />
                  )}
                  <AdDescription productDetails={productDetails} />
                </div>
              </div>
              <div className="flex flex-col col-span-1 lg:col-span-4 gap-7">
                {isMyListing ? (
                  <MyAdsListingDetailCard productDetails={productDetails} />
                ) : (
                  <AdDetailCard
                    productDetails={productDetails}
                    setProductDetails={setProductDetails}
                  />
                )}

                {!isMyListing && (
                  <SellerDetailCard
                    productDetails={productDetails}
                    setProductDetails={setProductDetails}
                  />
                )}

                <AdLocation productDetails={productDetails} />
                {!isMyListing && !productDetails?.is_already_reported && (
                  <AdsReportCard
                    productDetails={productDetails}
                    setProductDetails={setProductDetails}
                  />
                )}

                {isMyListing && (
                  <AdsStatusChangeCards
                    productDetails={productDetails}
                    setProductDetails={setProductDetails}
                    status={status}
                    setStatus={setStatus}
                  />
                )}

                {isEditedByAdmin && (
                  <AdEditedByAdmin
                    admin_edit_reason={productDetails?.admin_edit_reason}
                  />
                )}

                {isMyAdExpired && (
                  <RenewAd
                    item_id={productDetails?.id}
                    setProductDetails={setProductDetails}
                    setStatus={setStatus}
                    categoryId={productDetails?.category?.id}
                    categoryName={productDetails?.category?.translated_name}
                  />
                )}
                <SectionBanners banners={bannerMap["ad_info_side"]} className="hidden lg:block" />
                <AdUnit type='square' className="aspect-square" />
              </div>
            </div>
            {!isMyListing && (
              <SimilarAds
                productDetails={productDetails}
                aboveBanners={bannerMap["ad_info_below"]}
                belowBanners={bannerMap["similar_ads_below"]}
              />
            )}
            <div className="mt-6">
              <RelatedSearches
                productDetails={productDetails}
                filteredFields={filteredFields}
              />
            </div>
            <AdUnit type='banner' className="mt-8" />
            <OpenInAppDrawer
              isOpenInApp={isOpenInApp}
              setIsOpenInApp={setIsOpenInApp}
            />
          </div>
        </>
      ) : (
        <div className="container mt-8">
          <NoData title={t("noAdvertisementFound")} />
        </div>
      )}
    </>
  );
};

export default AdDetails;
