"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFaqApi } from "@/utils/api";
import CustomLink from "@/components/Common/CustomLink";
import Loader from "@/components/Common/Loader";
import FaqCard from "@/components/PagesComponent/Faq/FaqCard";
import NoData from "@/components/EmptyStates/NoData";
import { t } from "@/utils";
import { slugifyCategory, LEGAL_CATEGORY_SLUG } from "./helpSlug";
import { ArrowLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

const LEGAL_LINKS = [
  { labelKey: "privacyPolicy", href: "/privacy-policy" },
  { labelKey: "termsConditions", href: "/terms-and-condition" },
  { labelKey: "aboutUs", href: "/about-us" },
];

const HelpCategoryPage = () => {
  const router = useRouter();
  const { category: categorySlug } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isLegal = categorySlug === LEGAL_CATEGORY_SLUG;

  useEffect(() => {
    if (!isLegal) {
      fetchFaqs();
    } else {
      setIsLoading(false);
    }
  }, [categorySlug]);

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const res = await getFaqApi.getFaq();
      setFaqs(res?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const matchedFaqs = useMemo(() => {
    return faqs.filter(
      (faq) => slugifyCategory(faq?.category?.trim() || t("general")) === categorySlug
    );
  }, [faqs, categorySlug]);

  const categoryName = isLegal
    ? t("legalAndPrivacyInformation")
    : matchedFaqs[0]?.category || t("general");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (typeof window !== "undefined") {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
      <div className="flex items-center gap-3 px-4 py-4 border-b bg-white">
        <button
          onClick={handleBack}
          aria-label={t("back")}
          className="flex size-8 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted"
        >
          <ArrowLeftIcon size={18} className="rtl:scale-x-[-1]" />
        </button>
        <h1 className="font-semibold text-lg">{categoryName}</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {isLegal ? (
          <div className="flex flex-col gap-3">
            {LEGAL_LINKS.map((link) => (
              <CustomLink
                key={link.href}
                href={link.href}
                className="border rounded-lg p-4 flex items-center justify-between bg-white hover:border-primary transition-colors"
              >
                <span className="font-medium">{t(link.labelKey)}</span>
                <CaretRightIcon size={16} className="text-muted-foreground rtl:scale-x-[-1]" />
              </CustomLink>
            ))}
          </div>
        ) : isLoading ? (
          <Loader className="flex justify-center py-10" />
        ) : matchedFaqs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {matchedFaqs.map((faq) => (
              <FaqCard key={faq.id} faq={faq} />
            ))}
          </div>
        ) : (
          <NoData title={t("noFaqsFound")} />
        )}
      </div>
    </div>
  );
};

export default HelpCategoryPage;
