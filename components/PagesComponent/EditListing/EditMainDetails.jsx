import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getIsRtl } from "@/redux/reducer/languageSlice";
import {
  getCurrencyIsoCode,
  getCurrencyPosition,
  getCurrencySymbol,
  getGeminiAiEnabled,
} from "@/redux/reducer/settingSlice";
import { generateSlug, t } from "@/utils";
import { generateDescriptionApi } from "@/utils/api";
import PhoneInput from "react-phone-input-2";
import { useState } from "react";
import { HiSparkles } from "react-icons/hi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
const EditComponentOne = ({
  setTranslations,
  current,
  langId,
  defaultLangId,
  handleDetailsSubmit,
  is_job_category,
  isPriceOptional,
  currencies,
}) => {
  const currencyPosition = useSelector(getCurrencyPosition);
  const currencySymbol = useSelector(getCurrencySymbol);
  const currencyIsoCode = useSelector(getCurrencyIsoCode);
  const isRTL = useSelector(getIsRtl);
  const isGeminiAiEnabled = useSelector(getGeminiAiEnabled);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async () => {
    if (!current.name?.trim()) {
      toast.error(t("titleRequired"));
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateDescriptionApi.generateDescription({
        title: current.name,
        language_id: langId,
        ...(current.price ? { price: current.price } : {}),
        ...(selectedCurrency?.iso_code ? { currency_iso_code: selectedCurrency.iso_code } : {}),
      });
      if (res.data.error === false) {
        const description = res?.data?.data?.description;
        if (description) {
          setTranslations((prev) => ({
            ...prev,
            [langId]: { ...prev[langId], description },
          }));
        }
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error(t("somethingWentWrong"));
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCurrency = currencies?.find(
    (curr) => curr?.id === current?.currency_id
  );

  // Use selected currency's symbol and position, or fallback to Redux settings
  const displaySymbol = selectedCurrency?.symbol || currencySymbol;
  const displayPosition = selectedCurrency?.position || currencyPosition;

  const placeholderLabel =
    displayPosition === "right" ? `00 ${displaySymbol}` : `${displaySymbol} 00`;

  const handleField = (field) => (e) => {
    const value = e.target.value;
    setTranslations((prev) => {
      const updatedLangData = {
        ...prev[langId],
        [field]: value,
      };

      // ✅ Only auto-generate slug if default language and field is title
      if (field === "name" && langId === defaultLangId) {
        updatedLangData.slug = generateSlug(value);
      }

      return {
        ...prev,
        [langId]: updatedLangData,
      };
    });
  };

  const handlePhoneChange = (value, data) => {
    const dial = data?.dialCode || ""; // Dial code like "91", "1"
    const iso2 = data?.countryCode || ""; // Region code like "in", "us", "ae"
    setTranslations((prev) => {
      const pureMobile = value.startsWith(dial)
        ? value.slice(dial.length)
        : value;
      return {
        ...prev,
        [langId]: {
          ...prev[langId],
          contact: pureMobile,
          country_code: dial,
          region_code: iso2,
        },
      };
    });
  };

  const handleCurrencyChange = (currencyId) => {
    setTranslations((prev) => ({
      ...prev,
      [langId]: {
        ...prev[langId],
        currency_id: Number(currencyId),
      },
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="title"
          className={langId === defaultLangId ? "requiredInputLabel" : ""}
        >
          {t("title")}
        </Label>
        <Input
          type="text"
          name="title"
          id="title"
          placeholder={t("enterTitle")}
          value={current.name || ""}
          onChange={handleField("name")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="description"
          className={langId === defaultLangId ? "requiredInputLabel" : ""}
        >
          {t("description")}
        </Label>
        <Textarea
          name="description"
          id="description"
          placeholder={t("enterDescription")}
          value={current.description || ""}
          onChange={handleField("description")}
        />
        {isGeminiAiEnabled && (
          <div className="flex justify-end">
            <button
              type="button"
              className="text-primary flex items-center gap-1 py-1 px-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateDescription}
              disabled={isGenerating}
            >
              <HiSparkles className={`size-4 -scale-x-100 ${isGenerating ? "animate-spin" : ""}`} />
              <span className="text-sm">{isGenerating ? t("generating") : t("generateWithAi")}</span>
            </button>
          </div>
        )}
      </div>



      {langId === defaultLangId && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            {
              currencies?.length > 0 ?
                <Select
                  value={current?.currency_id?.toString()}
                  onValueChange={handleCurrencyChange}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* <SelectLabel>Currencies</SelectLabel> */}
                      {currencies?.map((currency) => (
                        <SelectItem
                          key={currency.id}
                          value={currency.id.toString()}
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          {currency.iso_code} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                :
                <Select
                  value={currencyIsoCode} // ✅ same default value you already have
                  disabled
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  {/* Required for RTL */}
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={currencyIsoCode}>
                        {currencyIsoCode} ({currencySymbol})
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
            }
          </div>
          {is_job_category ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="min_salary">{t("salaryMin")}</Label>
                <Input
                  type="number"
                  name="min_salary"
                  id="min_salary"
                  placeholder={placeholderLabel}
                  value={current.min_salary || ""}
                  onChange={handleField("min_salary")}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="max_salary">{t("salaryMax")}</Label>
                <Input
                  type="number"
                  name="max_salary"
                  id="max_salary"
                  placeholder={placeholderLabel}
                  value={current.max_salary || ""}
                  onChange={handleField("max_salary")}
                  min={0}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="price"
                className={
                  !isPriceOptional && langId === defaultLangId
                    ? "requiredInputLabel"
                    : ""
                }
              >
                {t("price")}
              </Label>
              <Input
                type="number"
                name="price"
                id="price"
                placeholder={placeholderLabel}
                value={current.price || ""}
                onChange={handleField("price")}
                min={0}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="phonenumber"
            >
              {t("phoneNumber")}
            </Label>
            <PhoneInput
              country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
              value={`${current.country_code}${current.contact}`}
              onChange={(phone, data) => handlePhoneChange(phone, data)}
              inputProps={{
                name: "phonenumber",
                id: "phonenumber",
              }}
              enableLongNumbers
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="videoLink">{t("videoLink")}</Label>
            <Input
              type="text"
              name="videoLink"
              id="videoLink"
              placeholder={t("enterAdditionalLinks")}
              value={current.video_link || ""}
              onChange={handleField("video_link")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">
              {t("slug")}{" "}
              <span className="text-sm text-muted-foreground">
                ({t("allowedSlug")})
              </span>
            </Label>
            <Input
              type="text"
              name="slug"
              id="slug"
              placeholder={t("enterSlug")}
              onChange={handleField("slug")}
              value={current.slug || ""}
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          className="bg-primary text-white  px-4 py-2 rounded-md text-xl"
          onClick={handleDetailsSubmit}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default EditComponentOne;
