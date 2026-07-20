"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  editItemApi,
  getCurrenciesApi,
  getCustomFieldsApi,
  getMyItemsApi,
  getMyReelsApi,
  getParentCategoriesApi,
  uploadMediaApi,
} from "@/utils/api";
import useFFmpeg from "@/components/PagesComponent/AdsListing/useFFmpeg";
import {
  filterNonDefaultTranslations,
  getMainDetailsTranslations,
  getSeoApiReadyData,
  isValidURL,
  isValidVimeoUrl,
  isValidYouTubeUrl,
  prefillExtraDetails,
  prepareCustomFieldFiles,
  prepareCustomFieldTranslations,
  t,
  validateExtraDetails,
  validateSeoDetails,
} from "@/utils";
import EditMainDetails from "./EditMainDetails";
import EditExtraDetails from "./EditExtraDetails";
import EditImageUpload from "./EditImageUpload";
import EditLocation from "./EditLocation";
import MetaDetails from "../AdsListing/MetaDetails";
import { toast } from "sonner";
import Layout from "@/components/Layout/Layout";
import Checkauth from "@/HOC/Checkauth";
import { useSelector } from "react-redux";
import AdSuccessModal from "../AdsListing/AdSuccessModal";
import {
  getDefaultLanguageCode,
  getLanguages,
  getReelMaxDuration,
  getReelMaxSize,
  getVideoMaxSize,
} from "@/redux/reducer/settingSlice";
import AdLanguageSelector from "../AdsListing/AdLanguageSelector";
import PageLoader from "@/components/Common/PageLoader";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { useParams } from "next/navigation";

const EditListing = () => {
  const { lang: langCode, id } = useParams();
  const [step, setStep] = useState(1);
  const [CreatedAdSlug, setCreatedAdSlug] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [OtherImages, setOtherImages] = useState([]);
  const [Location, setLocation] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [deleteImagesId, setDeleteImagesId] = useState([]);
  const [isAdPlaced, setIsAdPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seoDetails, setSeoDetails] = useState([]);
  const [existingReel, setExistingReel] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const { trimVideo } = useFFmpeg();
  const reelMaxDuration = useSelector(getReelMaxDuration);
  const reelMaxSize = useSelector(getReelMaxSize);
  const videoMaxSize = useSelector(getVideoMaxSize);

  const languages = useSelector(getLanguages);
  const defaultLanguageCode = useSelector(getDefaultLanguageCode);
  const defaultLangId = languages?.find(
    (lang) => lang.code === defaultLanguageCode
  )?.id;

  const [extraDetails, setExtraDetails] = useState({
    [defaultLangId]: {},
  });
  const [langId, setLangId] = useState(defaultLangId);

  const [translations, setTranslations] = useState({
    [defaultLangId]: {},
  });
  const hasTextbox = customFields.some((field) => field.type === "textbox");

  const defaultDetails = translations[defaultLangId] || {};
  const currentDetails = translations[langId] || {};
  const currentExtraDetails = extraDetails[langId] || {};
  const isReel = defaultDetails?.item_type === "reel";

  const is_job_category =
    Number(
      selectedCategoryPath[selectedCategoryPath.length - 1]?.is_job_category
    ) === 1;
  const isPriceOptional =
    Number(
      selectedCategoryPath[selectedCategoryPath.length - 1]?.price_optional
    ) === 1;

  useEffect(() => {
    getSingleListingData();
  }, [langCode]);

  const fetchCategoryPath = async (childCategoryId) => {
    try {
      const categoryResponse =
        await getParentCategoriesApi.getPaymentCategories({
          child_category_id: childCategoryId,
        });
      setSelectedCategoryPath(categoryResponse?.data?.data);
    } catch (error) {
      console.log("Error fetching category path:", error);
    }
  };

  const getCustomFields = async (categoryId, extraFieldValue) => {
    try {
      const customFieldsRes = await getCustomFieldsApi.getCustomFields({
        category_id: categoryId,
      });
      const data = customFieldsRes?.data?.data;
      setCustomFields(data);
      const tempExtraDetails = prefillExtraDetails({
        data,
        languages,
        defaultLangId,
        extraFieldValue,
        setFilePreviews,
      });
      setExtraDetails(tempExtraDetails);
      setLangId(defaultLangId);
    } catch (error) {
      console.log("Error fetching custom fields:", error);
    }
  };

  const getCurrencies = async () => {
    try {
      const res = await getCurrenciesApi.getCurrencies();
      const currenciesData = res?.data?.data || [];
      setCurrencies(currenciesData);
      return currenciesData; // Return the currencies data
    } catch (error) {
      console.log("error", error);
      return [];
    }
  };

  const getSingleListingData = async () => {
    try {
      setIsLoading(true);
      const res = await getMyItemsApi.getMyItems({ id: Number(id) });
      const listingData = res?.data?.data?.data?.[0];
      if (!listingData) {
        throw new Error("Listing not found");
      }
      // Get currencies data directly
      const [_, __, currenciesData] = await Promise.all([
        getCustomFields(
          listingData.category.id,
          listingData?.all_translated_custom_fields
        ),
        fetchCategoryPath(listingData?.category_id),
        getCurrencies(),
      ]);

      setOtherImages(
        listingData?.gallery_images.map((img) => ({
          ...img,
          preview: img.image,
          file: { name: String(img.id ?? "img"), size: 0 },
        }))
      );

      const seoDetail = listingData?.seo_detail;
      if (seoDetail) {
        const translations = [...(seoDetail.translations || [])];
        if (defaultLangId) {
          translations.unshift({
            language_id: defaultLangId,
            meta_title: seoDetail.meta_title || "",
            meta_description: seoDetail.meta_description || "",
            meta_keywords: seoDetail.meta_keywords || "",
            schema: seoDetail.schema || "",
          });
        }
        setSeoDetails(translations);
      }

      const mainDetailsTranslation = getMainDetailsTranslations(
        listingData,
        languages,
        defaultLangId,
        currenciesData
      );
      setTranslations(mainDetailsTranslation);

      if (listingData.item_type === "reel") {
        const reelRes = await getMyReelsApi.getMyReels({ item_id: listingData.id });
        if (reelRes?.data?.error === false) {
          setExistingReel(reelRes?.data?.data?.data?.[0] ?? null);
        }
      }

      setLocation({
        country: listingData?.country,
        state: listingData?.state,
        city: listingData?.city,
        formattedAddress: listingData?.translated_address,
        lat: listingData?.latitude,
        long: listingData?.longitude,
        area_id: listingData?.area_id ? listingData?.area_id : null,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (step == 3 && customFields?.length == 0) {
      setStep((prev) => prev - 2); // MetaDetails → MainDetails (skip ExtraDetails)
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const SLUG_RE = /^[a-z0-9-]+$/i;
  const isEmpty = (x) => !x || !x.toString().trim();
  const isNegative = (n) => Number(n) < 0;
  const VIDEO_LINK_VALIDATORS = {
    youtube_link: isValidYouTubeUrl,
    vimeo_link: isValidVimeoUrl,
    other_link: isValidURL,
  };

  // Step 1 (EditMainDetails): title/description, phone, price or job salary, slug
  const validateDetailsStep = () => {
    const {
      name,
      description,
      price,
      slug,
      contact,
      min_salary,
      max_salary,
      country_code,
    } = defaultDetails;

    if (isEmpty(name) || isEmpty(description)) {
      toast.error(t("completeDetails"));
      return false;
    }

    // ✅ Validate phone number ONLY if user entered one as it is optional
    if (Boolean(contact) && !isValidPhoneNumber(`+${country_code}${contact}`)) {
      toast.error(t("invalidPhoneNumber"));
      return false;
    }

    if (is_job_category) {
      const min = min_salary ? Number(min_salary) : null;
      const max = max_salary ? Number(max_salary) : null;

      if (min !== null && min < 0) {
        toast.error(t("enterValidSalaryMin"));
        return false;
      }
      if (max !== null && max < 0) {
        toast.error(t("enterValidSalaryMax"));
        return false;
      }
      if (min !== null && max !== null) {
        if (min === max) {
          toast.error(t("salaryMinCannotBeEqualMax"));
          return false;
        }
        if (min > max) {
          toast.error(t("salaryMinCannotBeGreaterThanMax"));
          return false;
        }
      }
    } else {
      if (!isPriceOptional && isEmpty(price)) {
        toast.error(t("completeDetails"));
        return false;
      }
      if (!isEmpty(price) && isNegative(price)) {
        toast.error(t("enterValidPrice"));
        return false;
      }
    }

    if (!isEmpty(slug) && !SLUG_RE.test(slug.trim())) {
      toast.error(t("addValidSlug"));
      return false;
    }

    return true;
  };

  // Step 4 (EditImageUpload): video URL (if link type chosen), custom video size, reel duration/size within limit (post-trim), at least one gallery image
  const validateImagesStep = () => {
    const videoLinkValidator = VIDEO_LINK_VALIDATORS[defaultDetails.video_type];
    if (videoLinkValidator && !isEmpty(defaultDetails.video_link) && !videoLinkValidator(defaultDetails.video_link)) {
      toast.error(t("enterValidUrl"));
      return false;
    }

    if ((defaultDetails.video_type || "file") === "file" && defaultDetails.product_video) {
      const productVideoSizeMB = defaultDetails.product_video.size / (1024 * 1024);
      if (videoMaxSize && productVideoSizeMB > videoMaxSize) {
        toast.error(`${t("videoExceedsMaxSize")} ${videoMaxSize} MB`);
        return false;
      }
    }

    if (isReel && videoData) {
      const { file, trimmedFile, duration, trimStart, trimEnd } = videoData;
      const effectiveDuration = trimStart != null && trimEnd != null ? trimEnd - trimStart : duration;
      if (reelMaxDuration && effectiveDuration > reelMaxDuration) {
        toast.error(`${t("videoExceedsMaxDuration")} ${reelMaxDuration}s`);
        return false;
      }
      const effectiveSizeMB = trimmedFile
        ? trimmedFile.size / (1024 * 1024)
        : duration > 0
          ? (file.size / (1024 * 1024)) * (effectiveDuration / duration)
          : file.size / (1024 * 1024);
      if (reelMaxSize && effectiveSizeMB > reelMaxSize) {
        toast.error(`${t("videoExceedsMaxSize")} ${reelMaxSize} MB`);
        return false;
      }
    }

    if (OtherImages.length === 0) {
      toast.error(t("uploadMainPicture"));
      return false;
    }

    return true;
  };

  const handleDetailsSubmit = () => {
    if (!validateDetailsStep()) return;
    setStep(customFields?.length === 0 ? 3 : 2); // skip ExtraDetails → MetaDetails
  };

  const submitExtraDetails = () => {
    if (
      customFields.length !== 0 &&
      !validateExtraDetails({
        languages,
        defaultLangId,
        extraDetails,
        customFields,
        filePreviews,
      })
    ) {
      return;
    }
    setStep(3);
  };

  const handleMetaDetailsSubmit = () => {
    if (!validateSeoDetails(seoDetails, languages, defaultLangId)) return;
    setStep(4);
  };

  const handleImageSubmit = () => {
    if (!validateImagesStep()) return;
    setStep(5);
  };

  const editAd = async () => {
    if (
      !Location?.country ||
      !Location?.state ||
      !Location?.city ||
      !Location?.formattedAddress
    ) {
      toast.error(t("pleaseSelectCity"));
      return;
    }

    const nonDefaultTranslations = filterNonDefaultTranslations(
      translations,
      defaultLangId
    );
    const customFieldTranslations =
      prepareCustomFieldTranslations(extraDetails);

    const customFieldFiles = prepareCustomFieldFiles(
      extraDetails,
      defaultLangId
    );

    const seo_details = getSeoApiReadyData(seoDetails);

    const allData = {
      id: id,
      name: defaultDetails.name,
      slug: defaultDetails.slug.trim(),
      description: defaultDetails?.description,
      price: defaultDetails.price,
      contact: defaultDetails.contact,
      region_code: defaultDetails?.region_code?.toUpperCase() || "",
      video_type: defaultDetails.video_type || "file",
      ...(VIDEO_LINK_VALIDATORS[defaultDetails.video_type] && defaultDetails.video_link
        ? { video_link: defaultDetails.video_link }
        : {}),
      gallery_images: OtherImages.map(img => img?.file || img?.image),
      address: Location?.formattedAddress,
      latitude: Location?.lat,
      longitude: Location?.long,
      custom_field_files: customFieldFiles,
      country: Location?.country,
      state: Location?.state,
      city: Location?.city,
      ...(Location?.area_id ? { area_id: Number(Location?.area_id) } : {}),
      delete_item_image_id: deleteImagesId,
      ...((defaultDetails.video_type || "file") === "file" &&
        !defaultDetails.existing_product_video_url &&
        !defaultDetails.product_video && { delete_product_video: true }),
      ...(Object.keys(nonDefaultTranslations).length > 0 && {
        translations: nonDefaultTranslations,
      }),
      ...(defaultDetails?.currency_id && {
        currency_id: defaultDetails?.currency_id,
      }),
      ...(Object.keys(customFieldTranslations).length > 0 && {
        custom_field_translations: customFieldTranslations,
      }),
      seo_details
    };

    if (is_job_category) {
      // Only add salary fields if they're provided
      allData.min_salary = defaultDetails.min_salary;
      allData.max_salary = defaultDetails.max_salary;
    } else {
      allData.price = defaultDetails.price;
    }

    try {
      setIsAdPlaced(true);
      const res = await editItemApi.editItem(allData);
      if (res?.data?.error === false) {
        const itemId = res?.data?.data[0]?.id;
        let mediaParams = null;
        if (isReel && videoData && itemId) {
          const { file, trimmedFile, thumbnail } = videoData;
          const thumbBlob = await fetch(thumbnail).then((r) => r.blob());
          const thumbFile = new File([thumbBlob], "thumbnail.jpg", { type: "image/jpeg" });
          mediaParams = { item_id: itemId, video: trimmedFile ?? file, thumbnail: thumbFile };
        }
        if (defaultDetails.video_type === "file" && defaultDetails.product_video && itemId) {
          mediaParams = { ...mediaParams, item_id: itemId, product_video: defaultDetails.product_video };
        }
        if (mediaParams) {
          const mediaRes = await uploadMediaApi.uploadMedia(mediaParams);
          if (mediaRes?.data?.error !== false) {
            toast.error(mediaRes?.data?.message || t("somethingWentWrong"));
            return;
          }
        }
        setOpenSuccessModal(true);
        setCreatedAdSlug(res?.data?.data[0]?.slug);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdPlaced(false);
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          <BreadCrumb title2={t("editListing")} />
          <div className="container">
            <div className="flex flex-col gap-6 mt-8">

              <div className="flex items-center gap-3 justify-between">
                <h1 className="hidden sm:block text-2xl font-medium">{t("editListing")}</h1>

                {/* mobile only label */}
                <h1 className="text-2xl font-medium sm:hidden">
                  {
                    step == 1 ? t("editDetails") : step == 2 ? t('editExtraDetails') : step == 3 ? t("meta") : step == 4 ? t('editImages') : step == 5 ? t("editLocation") : t("editListing")
                  }
                </h1>

                {/* Mobile-only selector */}
                <div className="sm:hidden">
                  {(step == 1 || (step === 2 && hasTextbox) || step === 4) && (
                    <AdLanguageSelector
                      langId={langId}
                      setLangId={setLangId}
                      languages={languages}
                      setTranslations={setTranslations}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6 sm:border rounded-md sm:p-4">
                <div className="hidden sm:flex items-center gap-3 justify-between bg-muted px-4 py-2 rounded-md flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className={`transition-all duration-300 p-2 rounded-md ${step === 1 ? "bg-primary text-white" : ""
                        }`}
                    >
                      {t("details")}
                    </div>
                    {customFields?.length > 0 && (
                      <div
                        className={`transition-all duration-300 p-2 rounded-md ${step === 2 ? "bg-primary text-white" : ""
                          }`}
                      >
                        {t("extraDetails")}
                      </div>
                    )}
                    <div
                      className={`transition-all duration-300 p-2 rounded-md ${step === 3 ? "bg-primary text-white" : ""
                        }`}
                    >
                      {t("meta")}
                    </div>
                    <div
                      className={`transition-all duration-300 p-2 rounded-md ${step === 4 ? "bg-primary text-white" : ""
                        }`}
                    >
                      {t("media")}
                    </div>
                    <div
                      className={`transition-all duration-300 p-2 rounded-md ${step === 5 ? "bg-primary text-white" : ""
                        }`}
                    >
                      {t("location")}
                    </div>
                  </div>
                  {(step === 1 || (step === 2 && hasTextbox) || step === 3) && (
                    <AdLanguageSelector
                      langId={langId}
                      setLangId={setLangId}
                      languages={languages}
                      setTranslations={setTranslations}
                    />
                  )}
                </div>
                {step === 1 &&
                  selectedCategoryPath &&
                  selectedCategoryPath?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h1 className="font-medium text-muted-foreground sm:text-black text-sm sm:text-xl">
                        {t("selectedCategory")}
                      </h1>
                      <div className="flex">
                        {selectedCategoryPath?.map((item, index) => {
                          const shouldShowComma =
                            selectedCategoryPath.length > 1 &&
                            index !== selectedCategoryPath.length - 1;
                          return (
                            <span className="text-primary" key={item.id}>
                              {item.name}
                              {shouldShowComma && ", "}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                <div>
                  {step == 1 && (
                    <EditMainDetails
                      setTranslations={setTranslations}
                      current={currentDetails}
                      langId={langId}
                      defaultLangId={defaultLangId}
                      handleDetailsSubmit={handleDetailsSubmit}
                      is_job_category={is_job_category}
                      isPriceOptional={isPriceOptional}
                      currencies={currencies}
                    />
                  )}

                  {step == 2 && customFields.length > 0 && (
                    <EditExtraDetails
                      customFields={customFields}
                      extraDetails={extraDetails}
                      setExtraDetails={setExtraDetails}
                      handleGoBack={handleGoBack}
                      filePreviews={filePreviews}
                      setFilePreviews={setFilePreviews}
                      submitExtraDetails={submitExtraDetails}
                      currentExtraDetails={currentExtraDetails}
                      langId={langId}
                      defaultLangId={defaultLangId}
                    />
                  )}

                  {step == 3 && (
                    <MetaDetails
                      seoDetails={seoDetails}
                      setSeoDetails={setSeoDetails}
                      langId={langId}
                      onNext={handleMetaDetailsSubmit}
                      handleGoBack={handleGoBack}
                      adTitle={currentDetails.name}
                      adPrice={defaultDetails.price}
                      currencyIsoCode={currencies.find(c => c.id === defaultDetails.currency_id)?.iso_code}
                    />
                  )}

                  {step == 4 && (
                    <EditImageUpload
                      OtherImages={OtherImages}
                      setOtherImages={setOtherImages}
                      handleImageSubmit={handleImageSubmit}
                      handleGoBack={handleGoBack}
                      setDeleteImagesId={setDeleteImagesId}
                      isReel={isReel}
                      existingReel={existingReel}
                      videoData={videoData}
                      setVideoData={setVideoData}
                      defaultDetails={defaultDetails}
                      setTranslations={setTranslations}
                      defaultLangId={defaultLangId}
                      trimVideo={trimVideo}
                    />
                  )}

                  {step == 5 && (
                    <EditLocation
                      handleGoBack={handleGoBack}
                      location={Location}
                      setLocation={setLocation}
                      onSubmit={editAd}
                      isAdPlaced={isAdPlaced}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <AdSuccessModal
            openSuccessModal={openSuccessModal}
            setOpenSuccessModal={setOpenSuccessModal}
            createdAdSlug={CreatedAdSlug}
          />
        </>
      )}
    </Layout>
  );
};

export default Checkauth(EditListing);
