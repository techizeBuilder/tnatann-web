"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { t } from "@/utils";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/Common/Loader";
import EmptyMessage from "@/components/EmptyStates/EmptyMessage";
import ReusableAlertDialog from "@/components/Common/ReusableAlertDialog";
import PaymentModal from "./PaymentModal/PaymentModal";
import BankDetailsModal from "./BankDetailsModal";
import {
  categoryApi,
  getPackageApi,
  getLocationApi,
  assigFreePackageApi,
  getPaymentSettingsApi,
} from "@/utils/api";
import { getIsLoggedIn } from "@/redux/reducer/authSlice";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import { ArrowLeftIcon, CrownIcon, LightningIcon, MapPinIcon, PhoneCallIcon, PencilSimpleLineIcon, ProhibitIcon, CheckCircleIcon } from "@phosphor-icons/react";

const EliteSeller = () => {
  const router = useRouter();
  const isLoggedIn = useSelector(getIsLoggedIn);

  // Category selection
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  // Location
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [debouncedLocation] = useDebounce(locationQuery, 400);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const isSuggestionClick = useRef(false);

  // Flow state
  const [isSelected, setIsSelected] = useState(false);
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Purchase flow
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [packageSettings, setPackageSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFreeConfirmModal, setShowFreeConfirmModal] = useState(false);
  const [packageToAssign, setPackageToAssign] = useState(null);
  const [isAssigningPackage, setIsAssigningPackage] = useState(false);

  useEffect(() => {
    fetchTopLevelCategories();
  }, []);

  useEffect(() => {
    if (showPaymentModal) {
      handleFetchPaymentSetting();
    }
  }, [showPaymentModal]);

  useEffect(() => {
    if (isSuggestionClick.current) {
      isSuggestionClick.current = false;
      return;
    }
    const fetchSuggestions = async () => {
      if (!debouncedLocation || debouncedLocation.trim().length < 2) {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        return;
      }
      try {
        const res = await getLocationApi.getLocation({ search: debouncedLocation, lang: "en" });
        const results = res?.data?.data || [];
        const formatted = results.map((r) => ({
          city: r?.city_translation || r?.city || "",
          description: [r?.city_translation, r?.state_translation, r?.country_translation].filter(Boolean).join(", "),
        })).filter((r) => r.city);
        setLocationSuggestions(formatted);
        setShowLocationSuggestions(true);
      } catch (error) {
        setLocationSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [debouncedLocation]);

  const fetchTopLevelCategories = async () => {
    try {
      const res = await categoryApi.getCategory({ category_id: null });
      if (res?.data?.error === false) {
        setCategories(res?.data?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId("");
    setSubcategories([]);
    try {
      setIsLoadingSubcategories(true);
      const res = await categoryApi.getCategory({ category_id: categoryId });
      if (res?.data?.error === false) {
        setSubcategories(res?.data?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleSelectLocation = (suggestion) => {
    isSuggestionClick.current = true;
    setSelectedCity(suggestion.city);
    setLocationQuery(suggestion.description || suggestion.city);
    setShowLocationSuggestions(false);
  };

  const canShowPackages = selectedCategoryId && selectedCity;

  const handleShowPackages = () => {
    if (!canShowPackages) return;
    setIsSelected(true);
    fetchElitePackages();
  };

  const fetchElitePackages = async () => {
    try {
      setIsLoadingPackages(true);
      const categoryId = selectedSubcategoryId || selectedCategoryId;
      const res = await getPackageApi.getPackage({
        type: "elite",
        category_id: categoryId,
        city: selectedCity,
      });
      if (res?.data?.error === false) {
        setPackages(res?.data?.data || []);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.log(error);
      setPackages([]);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const handleChange = () => {
    setIsSelected(false);
    setPackages([]);
  };

  const handleFetchPaymentSetting = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentSettingsApi.getPaymentSettings();
      setPackageSettings(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchasePackage = (pckg) => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    if (pckg?.final_price === 0) {
      if (pckg?.is_purchased_before) {
        toast.error(t("alreadyPurchasedFreePackage"));
        return;
      }
      setPackageToAssign(pckg.id);
      setShowFreeConfirmModal(true);
    } else {
      setSelectedPackage(pckg);
      setShowPaymentModal(true);
    }
  };

  const assignPackage = async (id) => {
    try {
      setIsAssigningPackage(true);
      const res = await assigFreePackageApi.assignFreePackage({ package_id: id });
      if (res?.data?.error === false) {
        toast.success(res?.data?.message);
        fetchElitePackages();
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAssigningPackage(false);
    }
  };

  const handleConfirmFreePackage = () => {
    if (packageToAssign) assignPackage(packageToAssign);
    setShowFreeConfirmModal(false);
  };

  const benefitIconClasses = "size-10 rounded-full bg-white border border-amber-200 flex items-center justify-center shadow-sm";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (typeof window !== "undefined") {
      window.close();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white py-8 px-4 sm:py-12">
      <div className="relative mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl overflow-hidden sm:p-8">
        {/* Decorative diamond pattern, top-right */}
        <div
          className="pointer-events-none absolute -top-4 ltr:-right-4 rtl:-left-4 size-40 opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #D4A017 0, #D4A017 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-45deg, #D4A017 0, #D4A017 1px, transparent 1px, transparent 14px)",
          }}
        />

        <button
          onClick={handleBack}
          aria-label={t("back")}
          className="absolute top-4 ltr:left-4 rtl:right-4 z-10 flex size-8 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted"
        >
          <ArrowLeftIcon size={18} className="rtl:scale-x-[-1]" />
        </button>

        {/* Promo header */}
        <div className="relative text-center flex flex-col items-center gap-1 mb-4">
          <CrownIcon size={36} weight="fill" className="text-blue-900" />
          <h1 className="text-xl font-bold uppercase tracking-wide text-blue-900">{t("eliteSeller")}</h1>
          <div className="h-px w-20 bg-blue-900/30" />
          <p className="text-blue-900/80 italic text-sm flex items-center gap-1">
            {t("sellFast")} <LightningIcon weight="fill" className="text-amber-500" size={14} />
          </p>
        </div>

        <div className="relative flex items-center justify-center gap-2 mb-5 text-blue-900 font-bold text-sm">
          <span>{t("getUptoLabel")}</span>
          <span className="rounded-full border border-dashed border-blue-900/40 px-3 py-1 text-xs sm:text-sm">
            {t("twoXDirectCalls")}
          </span>
        </div>

        <div className="relative grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="rounded-lg border bg-gradient-to-b from-amber-50 to-white p-3 flex flex-col items-center gap-2">
            <div className={benefitIconClasses}>
              <PhoneCallIcon size={20} weight="fill" className="text-amber-500" />
            </div>
            <p className="text-xs font-semibold text-blue-900">{t("seriousBuyerCallsYouFirst")}</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-b from-amber-50 to-white p-3 flex flex-col items-center gap-2">
            <div className={benefitIconClasses}>
              <ProhibitIcon size={20} weight="bold" className="text-amber-500" />
            </div>
            <p className="text-xs font-semibold text-blue-900">{t("noExternalAdsOnListing")}</p>
          </div>
        </div>

        {!isSelected ? (
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-amber-400/70" />
              <p className="whitespace-nowrap text-center text-sm font-semibold text-blue-900">
                {t("selectCategoryToViewPackages")}
              </p>
              <div className="h-px flex-1 bg-amber-400/70" />
            </div>

            <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.translated_name || cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSubcategoryId}
              onValueChange={setSelectedSubcategoryId}
              disabled={!selectedCategoryId || isLoadingSubcategories || subcategories.length === 0}
            >
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder={t("selectSubcategory")} />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.translated_name || cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <MapPinIcon size={18} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setSelectedCity("");
                  }}
                  onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
                  onBlur={() => setShowLocationSuggestions(false)}
                  placeholder={t("enterLocation")}
                  className="w-full outline-hidden text-sm"
                />
              </div>
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
                  {locationSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectLocation(s)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <MapPinIcon size={16} className="shrink-0 text-muted-foreground" />
                      {s.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              *{t("packageWillBeValidOnlyForSelectedCategoryAndLocation")}
            </p>

            <Button
              disabled={!canShowPackages}
              onClick={handleShowPackages}
              className="rounded-lg bg-blue-900 hover:bg-blue-800 disabled:bg-muted"
            >
              {t("showPackages")}
            </Button>
          </div>
        ) : (
          <>
            <div className="p-3 border rounded-lg mb-6 flex items-center justify-between">
              <div className="text-sm">
                <p className="text-muted-foreground text-xs uppercase">{t("selectedCategoryAndLocation")}</p>
                <p className="font-medium">
                  {(subcategories.find((c) => String(c.id) === selectedSubcategoryId) ||
                    categories.find((c) => String(c.id) === selectedCategoryId))?.translated_name}
                  {" | "}
                  {selectedCity}
                </p>
              </div>
              <button onClick={handleChange} className="text-blue-900 flex items-center gap-1 text-sm font-medium">
                <PencilSimpleLineIcon size={16} /> {t("change")}
              </button>
            </div>

            {isLoadingPackages ? (
              <Loader className="flex justify-center py-10" />
            ) : packages.length > 0 ? (
              <div className="flex flex-col gap-4">
                {packages.map((pckg) => (
                  <div key={pckg.id} className="rounded-lg border overflow-hidden">
                    <div className="bg-amber-50 border-b border-amber-200 py-1.5 text-center text-xs font-semibold text-amber-700">
                      {t("postingNewAdGoElite")}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-base">{pckg.translated_name || pckg.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                          onClick={() => handlePurchasePackage(pckg)}
                          disabled={pckg?.user_purchased_packages?.length > 0}
                        >
                          {pckg?.user_purchased_packages?.length > 0 ? t("purchased") : t("viewPlans")}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{t("letBuyersCallYouDirectly")}</p>

                      <p className="text-xs text-muted-foreground">{t("starting")}</p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold">{pckg.formatted_final_price}</span>
                        {pckg.discount_in_percentage > 0 && (
                          <>
                            <span className="line-through text-muted-foreground text-sm">{pckg.formatted_price}</span>
                            <span className="text-emerald-600 text-sm font-semibold">{pckg.discount_in_percentage}% {t("off")}</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 text-sm border-t border-dashed pt-3">
                        {[
                          t("getBuyerCallsBeforeAnyoneElse"),
                          t("standOutWithEliteBadge"),
                          t("chatsPinnedToTop"),
                          t("viewPhoneNumberForAllBuyers"),
                          ...(pckg.translated_key_points || []),
                        ].map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircleIcon size={18} weight="fill" className="text-emerald-600 shrink-0" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMessage message={t("noEliteDealFound")} />
            )}
          </>
        )}
      </div>
      </div>

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        selectedPackage={selectedPackage}
        packageSettings={packageSettings}
        isLoading={isLoading}
      />
      <BankDetailsModal
        packageId={selectedPackage?.id}
        bankDetails={packageSettings?.bankTransfer}
      />
      <ReusableAlertDialog
        open={showFreeConfirmModal}
        title={t("confirm")}
        description={t("confirmFreePackage")}
        onCancel={() => setShowFreeConfirmModal(false)}
        onConfirm={handleConfirmFreePackage}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
        confirmDisabled={isAssigningPackage}
      />
    </>
  );
};

export default EliteSeller;
