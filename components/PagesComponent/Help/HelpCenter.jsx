"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getFaqApi } from "@/utils/api";
import CustomLink from "@/components/Common/CustomLink";
import Loader from "@/components/Common/Loader";
import FaqCard from "@/components/PagesComponent/Faq/FaqCard";
import { t } from "@/utils";
import { slugifyCategory, LEGAL_CATEGORY_SLUG } from "./helpSlug";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  MegaphoneIcon,
  AppWindowIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

const CATEGORY_ICONS = {
  "My Account": UserCircleIcon,
  "Posting & Managing Ads": MegaphoneIcon,
  "Application Related": AppWindowIcon,
  "Payment and Package": CreditCardIcon,
};

const HelpCenter = () => {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFaqs();
  }, []);

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

  const categories = useMemo(() => {
    const grouped = {};
    faqs.forEach((faq) => {
      const cat = faq?.category?.trim() || t("general");
      (grouped[cat] ||= []).push(faq);
    });
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      slug: slugifyCategory(name),
      count: items.length,
    }));
  }, [faqs]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return faqs.filter((faq) => {
      const question = (faq?.translated_question || faq?.question || "").toLowerCase();
      const answer = (faq?.translated_answer || faq?.answer || "").toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [search, faqs]);

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
        <h1 className="font-semibold text-lg">{t("helpCenter")}</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-center text-2xl sm:text-3xl font-bold mb-6">
          {t("hiHowCanWeHelpYou")}
        </h2>

        <div className="relative mb-10">
          <MagnifyingGlassIcon
            size={20}
            className="absolute top-1/2 -translate-y-1/2 ltr:left-4 rtl:right-4 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchHelpCenter")}
            className="w-full rounded-lg border px-12 py-3 outline-hidden focus:border-primary"
          />
        </div>

        {isLoading ? (
          <Loader className="flex justify-center py-10" />
        ) : search.trim() ? (
          <div className="flex flex-col gap-4">
            {searchResults.length > 0 ? (
              searchResults.map((faq) => <FaqCard key={faq.id} faq={faq} />)
            ) : (
              <p className="text-center text-muted-foreground">{t("noFaqsFound")}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || UserCircleIcon;
              return (
                <CustomLink
                  key={cat.slug}
                  href={`/help/${cat.slug}`}
                  className="border rounded-lg p-5 flex items-center gap-4 bg-white hover:border-primary transition-colors"
                >
                  <div className="size-11 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("seeAllArticles").replace("{count}", cat.count)}
                    </p>
                  </div>
                  <CaretRightIcon size={18} className="text-muted-foreground shrink-0 rtl:scale-x-[-1]" />
                </CustomLink>
              );
            })}

            <CustomLink
              href={`/help/${LEGAL_CATEGORY_SLUG}`}
              className="border rounded-lg p-5 flex items-center gap-4 bg-white hover:border-primary transition-colors"
            >
              <div className="size-11 rounded-full bg-muted flex items-center justify-center text-primary shrink-0">
                <ShieldCheckIcon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{t("legalAndPrivacyInformation")}</p>
                <p className="text-sm text-muted-foreground">{t("termsPrivacyAndMore")}</p>
              </div>
              <CaretRightIcon size={18} className="text-muted-foreground shrink-0 rtl:scale-x-[-1]" />
            </CustomLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
