"use client";
import { useEffect, useState } from "react";
import CategorySelectToListAd from "./CategorySelectToListAd";
import {
  addItemApi,
  categoryApi,
  getCurrenciesApi,
  getCustomFieldsApi,
  getParentCategoriesApi,
  uploadMediaApi,
} from "@/utils/api";
import useFFmpeg from "@/components/PagesComponent/AdsListing/useFFmpeg";
import {
  filterNonDefaultTranslations,
  getDefaultCountryCode,
  isValidURL,
  isValidVimeoUrl,
  isValidYouTubeUrl,
  prepareCustomFieldFiles,
  prepareCustomFieldTranslations,
  t,
  validateExtraDetails,
  getSeoApiReadyData,
  validateSeoDetails
} from "@/utils";
import { toast } from "sonner";
import ExtraDetails from "./ExtraDetails";
import ImageUpload from "./ImageUpload";
import LocationSelectToListAd from "./LocationSelectToListAd";
import { useSelector } from "react-redux";
import AdSuccessModal from "./AdSuccessModal";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import Layout from "@/components/Layout/Layout";
import Checkauth from "@/HOC/Checkauth";
import AdLanguageSelector from "./AdLanguageSelector";
import {
  getDefaultLanguageCode,
  getLanguages,
  getReelMaxDuration,
  getReelMaxSize,
  getVideoMaxSize,
} from "@/redux/reducer/settingSlice";
import { userSignUpData } from "@/redux/reducer/authSlice";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { getCurrentCountry } from "@/redux/reducer/locationSlice";
import PackageRequiredModal from "../Home/PackageRequiredModal";
import { useParams, useSearchParams } from "next/navigation";
import MainDetails from "./MainDetails";
import MetaDetails from "./MetaDetails";

const AdsListing = () => {
  const { lang: langCode } = useParams();
  const searchParams = useSearchParams();
  const itemType = searchParams.get("type");
  const currentCountry = useSelector(getCurrentCountry);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState();
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isLoadMoreCat, setIsLoadMoreCat] = useState(false);
  const [categoryPath, setCategoryPath] = useState([]);
  const [currentPage, setCurrentPage] = useState();
  const [lastPage, setLastPage] = useState();
  const [customFields, setCustomFields] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [otherImages, setOtherImages] = useState([]);
  const [videoData, setVideoData] = useState(null);
  const [location, setLocation] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [isAdPlaced, setIsAdPlaced] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [createdAdSlug, setCreatedAdSlug] = useState("");
  const userData = useSelector(userSignUpData);
  const [packageModalCategory, setPackageModalCategory] = useState(null);
  const [seoDetails, setSeoDetails] = useState([]);

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

  const countryCode =
    userData?.country_code?.replace("+", "") || getDefaultCountryCode();
  const mobile = userData?.mobile || "";
  const regionCode =
    userData?.region_code?.toLowerCase() ||
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toLowerCase() ||
    "in";

  const [translations, setTranslations] = useState({
    [langId]: {
      contact: mobile,
      country_code: countryCode,
      region_code: regionCode,
      video_type: "file",
      video_link: "",
      product_video: null,
    },
  });
  const hasTextbox = customFields.some((field) => field.type === "textbox");

  const defaultDetails = translations[defaultLangId] || {};
  const currentDetails = translations[langId] || {};
  const currentExtraDetails = extraDetails[langId] || {};

  const is_job_category =
    Number(categoryPath[categoryPath.length - 1]?.is_job_category) === 1;
  const isPriceOptional =
    Number(categoryPath[categoryPath.length - 1]?.price_optional) === 1;

  let lastItemId = categoryPath[categoryPath.length - 1]?.id;

  useEffect(() => {
    if (step === 1) {
      handleFetchCategories();
    }
  }, [langCode]);

  useEffect(() => {
    if (step !== 1 && lastItemId) {
      getCustomFieldsData();
    }
  }, [lastItemId, langCode]);

  useEffect(() => {
    // Update category path translations when language changes
    if (categoryPath.length > 0) {
      const lastCategoryId = categoryPath[categoryPath.length - 1]?.id;
      if (lastCategoryId) {
        getParentCategoriesApi
          .getPaymentCategories({
            child_category_id: lastCategoryId,
          })
          .then((res) => {
            const updatedPath = res?.data?.data;
            if (updatedPath?.length > 0) {
              setCategoryPath(updatedPath);
            }
          })
          .catch((err) => {
            console.log("Error updating category path:", err);
          });
      }
    }
  }, [langCode]);

  useEffect(() => {
    getCurrencies();
  }, [countryCode]);

  const getCurrencies = async () => {
    try {
      let params = {};

      if (currentCountry) {
        params.country = currentCountry;
      }
      const res = await getCurrenciesApi.getCurrencies(params);
      const currenciesData = res?.data?.data || [];
      setCurrencies(currenciesData);
      // 🚫 IMPORTANT: If no currencies, REMOVE currency_id
      if (currenciesData.length === 0) {
        setTranslations((prev) => {
          const updated = { ...prev };

          if (updated[langId]?.currency_id) {
            delete updated[langId].currency_id;
          }

          return updated;
        });
        return;
      }
      // ✅ Normal case: set default currency
      const defaultCurrency =
        currenciesData.find((c) => c.selected == 1) || currenciesData[0];

      if (defaultCurrency && !translations[langId]?.currency_id) {
        setTranslations((prev) => ({
          ...prev,
          [langId]: {
            ...prev[langId],
            currency_id: defaultCurrency.id,
          },
        }));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleFetchCategories = async (
    category,
    isWaitForApiResToUpdatePath = false
  ) => {
    setCategoriesLoading(true);
    try {
      const categoryId = category ? category?.id : null;

      const res = await categoryApi.getCategory({
        category_id: categoryId,
      });
      if (res?.data?.error === false) {
        const data = res?.data?.data?.data;
        setCategories(data);
        setCurrentPage(res?.data?.data?.current_page);
        setLastPage(res?.data?.data?.last_page);
        if (isWaitForApiResToUpdatePath) {
          setCategoryPath((prevPath) => [...prevPath, category]);
          if (category.subcategories_count == 0) {
            setStep(2);
          }
        } else {
          const index = categoryPath.findIndex(
            (item) => item.id === category?.id
          );
          setCategoryPath((prevPath) => prevPath.slice(0, index + 1));
        }
      } else {
        if (res?.data?.code === 103) {
          setPackageModalCategory(category);
          return
        }
        toast.error(res?.data?.message)
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getCustomFieldsData = async () => {
    try {
      const res = await getCustomFieldsApi.getCustomFields({
        category_id: lastItemId,
      });
      const data = res?.data?.data;
      setCustomFields(data);

      const initializedDetails = {};

      languages.forEach((lang) => {
        const langFields = {};

        data.forEach((item) => {
          if (lang.id !== defaultLangId && item.type !== "textbox") return;

          let initialValue = "";
          switch (item.type) {
            case "checkbox":
            case "radio":
              initialValue = [];
              break;
            case "fileinput":
              initialValue = null;
              break;
            case "dropdown":
            case "textbox":
            case "number":
            case "text":
              initialValue = "";
              break;
            default:
              break;
          }
          langFields[item.id] = initialValue;
        });
        initializedDetails[lang.id] = langFields;
      });
      setExtraDetails(initializedDetails);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryTabClick = async (category) => {
    const reelBlocked = itemType === "video" && !category?.is_reel_allowed_in_listing;
    const listingBlocked = itemType !== "video" && !category?.is_listing_available;
    if (reelBlocked || listingBlocked) {
      setPackageModalCategory({ ...category, reelBlocked });
      return;
    }
    await handleFetchCategories(category, true);
  };

  const handleSelectedTabClick = (id) => {
    setCustomFields([]);
    setLangId(defaultLangId);
    setTranslations({
      [defaultLangId]: {
        contact: mobile,
        country_code: countryCode,
        region_code: regionCode,
        currency_id: translations[defaultLangId]?.currency_id,
      },
    });
    setExtraDetails({
      [defaultLangId]: {},
    });
    if (step !== 1) {
      setStep(1);
    }
    // ✅ SINGLE CATEGORY EDGE CASE

    const index = categoryPath.findIndex((item) => item.id === id);

    if (index === 0) {
      setCategoryPath([]);
      // Fetch root / all categories
      handleFetchCategories(null);
      return;
    }

    // ✅ NORMAL BACK-NAVIGATION FLOW
    const secondLast = categoryPath[index - 1];

    if (secondLast) {
      handleFetchCategories(secondLast);
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
  const VIDEO_LINK_ERROR_KEYS = {
    youtube_link: "enterValidYoutubeLink",
    vimeo_link: "enterValidVimeoLink",
    other_link: "enterValidUrl",
  };

  // Step 2 (MainDetails): title/description, phone, price or job salary, slug
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
      toast.error(t("completeDetails")); // Title, desc, phone required
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
        toast.error(t("completeDetails")); // Price is required
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

  // Step 5 (ImageUpload): video URL (if link type chosen), custom video size, reel duration/size within limit (post-trim), at least one gallery image
  const validateImagesStep = () => {
    const videoLinkValidator = VIDEO_LINK_VALIDATORS[defaultDetails.video_type];
    if (videoLinkValidator && !isEmpty(defaultDetails.video_link) && !videoLinkValidator(defaultDetails.video_link)) {
      toast.error(t(VIDEO_LINK_ERROR_KEYS[defaultDetails.video_type]));
      return false;
    }

    if ((defaultDetails.video_type || "file") === "file" && defaultDetails.product_video) {
      const productVideoSizeMB = defaultDetails.product_video.size / (1024 * 1024);
      if (videoMaxSize && productVideoSizeMB > videoMaxSize) {
        toast.error(`${t("videoExceedsMaxSize")} ${videoMaxSize} MB`);
        return false;
      }
    }

    if (videoData) {
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

    if (otherImages.length === 0) {
      toast.error(t("uploadMainPicture"));
      return false;
    }

    return true;
  };

  const handleDetailsSubmit = () => {
    if (!validateDetailsStep()) return;
    setStep(customFields?.length === 0 ? 4 : 3);
  };

  const handleExtraDetailsSubmit = () => {
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
    setStep(4);
  };

  const handleMetaDetailsSubmit = () => {
    if (!validateSeoDetails(seoDetails, languages, defaultLangId)) return;
    setStep(5);
  };

  const handleImagesSubmit = () => {
    if (!validateImagesStep()) return;
    setStep(6);
  };

  const postAd = async () => {
    if (
      !location?.country ||
      !location?.state ||
      !location?.city ||
      !location?.formattedAddress
    ) {
      toast.error(t("pleaseSelectCity"));
      return;
    }

    const customFieldTranslations =
      prepareCustomFieldTranslations(extraDetails);

    const customFieldFiles = prepareCustomFieldFiles(
      extraDetails,
      defaultLangId
    );
    const nonDefaultTranslations = filterNonDefaultTranslations(
      translations,
      defaultLangId
    );

    const seo_details = getSeoApiReadyData(seoDetails);

    const allData = {
      name: defaultDetails.name,
      slug: defaultDetails.slug.trim(),
      description: defaultDetails?.description,
      price: defaultDetails.price,
      contact: defaultDetails.contact,
      video_type: defaultDetails.video_type || "file",
      ...(VIDEO_LINK_VALIDATORS[defaultDetails.video_type] && defaultDetails.video_link
        ? { video_link: defaultDetails.video_link }
        : {}),
      // custom_fields: transformedCustomFields,
      category_id: lastItemId,
      gallery_images: otherImages.map((imgObj) => imgObj.file),
      address: location?.formattedAddress,
      latitude: location?.lat,
      longitude: location?.long,
      custom_field_files: customFieldFiles,
      country: location?.country,
      state: location?.state,
      city: location?.city,
      ...(location?.area_id ? { area_id: Number(location?.area_id) } : {}),
      ...(Object.keys(nonDefaultTranslations).length > 0 && {
        translations: nonDefaultTranslations,
      }),
      ...(Object.keys(customFieldTranslations).length > 0 && {
        custom_field_translations: customFieldTranslations,
      }),
      ...(seo_details?.length > 0 && { seo_details }),
      ...(defaultDetails?.currency_id && {
        currency_id: defaultDetails?.currency_id,
      }),
      region_code: defaultDetails?.region_code?.toUpperCase() || "",
      item_type: itemType === "video" ? "reel" : "normal",
    };
    if (is_job_category) {
      // Only add salary fields if they're provided
      if (defaultDetails.min_salary) {
        allData.min_salary = defaultDetails.min_salary;
      }
      if (defaultDetails.max_salary) {
        allData.max_salary = defaultDetails.max_salary;
      }
    }

    try {
      setIsAdPlaced(true);
      const res = await addItemApi.addItem(allData);
      if (res?.data?.error === false) {
        const itemId = res?.data?.data[0]?.id;
        const slug = res?.data?.data[0]?.slug;

        let mediaParams = null;
        if (videoData && itemId) {
          const { file, trimmedFile, thumbnail } = videoData;
          const thumbFile = new File([await fetch(thumbnail).then((r) => r.blob())], "thumbnail.jpg", { type: "image/jpeg" });
          mediaParams = { item_id: itemId, video: trimmedFile ?? file, thumbnail: thumbFile };
        }
        if (defaultDetails.video_type === "file" && defaultDetails.product_video && itemId) {
          mediaParams = { ...mediaParams, item_id: itemId, product_video: defaultDetails.product_video };
        }
        if (mediaParams) {
          const mediaRes = await uploadMediaApi.uploadMedia(mediaParams);
          if (mediaRes?.data?.error === true) {
            toast.error(mediaRes?.data?.message || t("somethingWentWrong"));
            return;
          }
        }
        setOpenSuccessModal(true);
        setCreatedAdSlug(slug);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdPlaced(false);
    }
  };

  const handleGoBack = () => {
    setStep((prev) => {
      if (customFields.length === 0 && step === 4) {
        return prev - 2;
      } else {
        return prev - 1;
      }
    });
  };

  const fetchMoreCategory = async () => {
    setIsLoadMoreCat(true);
    try {
      const response = await categoryApi.getCategory({
        page: `${currentPage + 1}`,
        category_id: lastItemId,
      });
      const { data } = response.data;
      setCategories((prev) => [...prev, ...data.data]);
      setCurrentPage(data?.current_page); // Update the current page
      setLastPage(data?.last_page); // Update the current page
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadMoreCat(false);
    }
  };

  const handleDeatilsBack = () => {
    handleSelectedTabClick(categoryPath.at(-1)?.id);
  };


  return (
    <Layout>
      <BreadCrumb title2={t("adListing")} />
      <div className="container">
        <div className="flex flex-col gap-8 mt-8">

          <div className="flex items-center gap-3 justify-between">
            <h1 className="hidden sm:block text-2xl font-medium">{t("adListing")}</h1>

            {/* mobile only label */}
            <h1 className="text-2xl font-medium sm:hidden">
              {
                step == 2 ? t("addDetails") : step == 3 ? t('addExtraDetails') : step == 4 ? t('addImages') : step == 5 ? t("addLocation") : t("adListing")
              }
            </h1>

            {/* Mobile-only selector */}
            <div className="sm:hidden">
              {(step == 2 || (step === 3 && hasTextbox) || step === 4) && (
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
            <div className="hidden sm:flex items-center gap-3 justify-between bg-muted px-4 sm:py-2 rounded-md flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`transition-all duration-300 p-2 rounded-md ${step === 1 ? "bg-primary text-white" : ""
                    }`}
                >
                  {t("selectedCategory")}
                </div>
                <div
                  className={`transition-all duration-300 p-2 rounded-md ${step === 2 ? "bg-primary text-white" : ""
                    }`}
                >
                  {t("details")}
                </div>

                {customFields?.length > 0 && (
                  <div
                    className={`transition-all duration-300 p-2 rounded-md ${step === 3 ? "bg-primary text-white" : ""
                      }`}
                  >
                    {t("extraDetails")}
                  </div>
                )}

                <div
                  className={`transition-all duration-300 p-2 rounded-md ${step === 4 ? "bg-primary text-white" : ""
                    }`}
                >
                  {t("meta")}
                </div>

                <div
                  className={`transition-all duration-300 p-2 rounded-md ${step === 5 ? "bg-primary text-white" : ""
                    }`}
                >
                  {t("media")}
                </div>

                <div
                  className={`transition-all duration-300 p-2 rounded-md ${step === 6 ? "bg-primary text-white" : ""
                    }`}
                >
                  {t("location")}
                </div>
              </div>

              {(step == 2 || (step === 3 && hasTextbox) || step === 4) && (
                <AdLanguageSelector
                  langId={langId}
                  setLangId={setLangId}
                  languages={languages}
                  setTranslations={setTranslations}
                />
              )}
            </div>

            {(step == 1 || step == 2) &&
              (
                categoryPath?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-muted-foreground sm:text-black text-sm sm:text-xl">{t("selectedCategory")}</p>
                    <div className="flex">
                      {categoryPath?.map((item, index) => {
                        const shouldShowComma =
                          categoryPath.length > 1 &&
                          index !== categoryPath.length - 1;
                        return (
                          <button
                            key={item.id}
                            className="text-primary ltr:text-left rtl:text-right"
                            onClick={() => handleSelectedTabClick(item?.id)}
                            disabled={categoriesLoading}
                          >
                            {item.translated_name || item.name}
                            {shouldShowComma && ", "}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) :
                  (
                    // mobile only label
                    <p className="block sm:hidden font-medium text-muted-foreground text-sm -mb-6">{t("selectTheCategory")}</p>
                  )
              )
            }
            <div>
              {step == 1 && (
                <CategorySelectToListAd
                  categories={categories}
                  setCategoryPath={setCategoryPath}
                  fetchMoreCategory={fetchMoreCategory}
                  lastPage={lastPage}
                  currentPage={currentPage}
                  isLoadMoreCat={isLoadMoreCat}
                  handleCategoryTabClick={handleCategoryTabClick}
                  categoriesLoading={categoriesLoading}
                />
              )}

              {step == 2 && (
                <MainDetails
                  currencies={currencies}
                  setTranslations={setTranslations}
                  current={currentDetails}
                  langId={langId}
                  defaultLangId={defaultLangId}
                  handleDetailsSubmit={handleDetailsSubmit}
                  is_job_category={is_job_category}
                  isPriceOptional={isPriceOptional}
                  handleDeatilsBack={handleDeatilsBack}
                />
              )}

              {step == 3 && (
                <ExtraDetails
                  customFields={customFields}
                  setExtraDetails={setExtraDetails}
                  filePreviews={filePreviews}
                  setFilePreviews={setFilePreviews}
                  onNext={handleExtraDetailsSubmit}
                  handleGoBack={handleGoBack}
                  currentExtraDetails={currentExtraDetails}
                  langId={langId}
                  defaultLangId={defaultLangId}
                />
              )}

              {step === 4 && (
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

              {step == 5 && (
                <ImageUpload
                  otherImages={otherImages}
                  setOtherImages={setOtherImages}
                  videoData={videoData}
                  setVideoData={setVideoData}
                  onNext={handleImagesSubmit}
                  handleGoBack={handleGoBack}
                  defaultDetails={defaultDetails}
                  setTranslations={setTranslations}
                  defaultLangId={defaultLangId}
                  trimVideo={trimVideo}
                />
              )}

              {step == 6 && (
                <LocationSelectToListAd
                  location={location}
                  setLocation={setLocation}
                  onSubmit={postAd}
                  isAdPlaced={isAdPlaced}
                  handleGoBack={handleGoBack}
                />
              )}
            </div>
          </div>
        </div>
        <AdSuccessModal
          openSuccessModal={openSuccessModal}
          setOpenSuccessModal={setOpenSuccessModal}
          createdAdSlug={createdAdSlug}
        />
        <PackageRequiredModal
          open={!!packageModalCategory}
          onClose={() => setPackageModalCategory(null)}
          categoryId={packageModalCategory?.id}
          customMessage={packageModalCategory?.reelBlocked
            ? `${t("reelsAreNotAllowedIn")} ${packageModalCategory?.translated_name}`
            : `${t("subscribeToPackageFor")} ${packageModalCategory?.translated_name}`}
        />
      </div>
    </Layout>
  );
};

export default Checkauth(AdsListing);
