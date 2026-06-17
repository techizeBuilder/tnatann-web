import Ads from "@/components/PagesComponent/Ads/Ads";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";
import { fetchSeoData, getKeywords, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";

export const dynamic = "force-dynamic";

const buildCanonicalParams = (searchParams) => {
  const params = new URLSearchParams();
  const { category } = searchParams || {};
  if (category) params.append("category", category);
  return params.toString();
};

const getCategorySeoData = async (category, langCode) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-categories?slug=${category}`,
    {
      headers: { "Content-Language": langCode || "en" },
      next: {
        revalidate: SEO_REVALIDATE_SECONDS,
      },
    }
  );
  const data = await response.json();
  return data?.self_category?.seo_detail;
};

export const generateMetadata = async ({ params, searchParams }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const originalSearchParams = await searchParams;
  const category = originalSearchParams?.category;
  const { lang: langCode } = await params;

  try {

    let title = process.env.NEXT_PUBLIC_META_TITLE;
    let description = process.env.NEXT_PUBLIC_META_DESCRIPTION;
    let keywords = process.env.NEXT_PUBLIC_META_kEYWORDS;
    let image = "";

    if (category) {
      // Fetch category-specific SEO
      const seo_detail = await getCategorySeoData(category, langCode);
      title = seo_detail?.translated_meta_title || title;
      description = seo_detail?.translated_meta_description || description;
      keywords =
        getKeywords(seo_detail?.translated_meta_keywords, process.env.NEXT_PUBLIC_META_kEYWORDS);
      image = seo_detail?.image || image;
    } else {
      // Fetch default ad listing SEO
      const adListing = await fetchSeoData({ page: "ad-listing", langCode });
      title = adListing?.translated_title || title;
      description = adListing?.translated_description || description;
      keywords = adListing?.translated_keywords || keywords;
      image = adListing?.image || image;
    }

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();

    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
    const paramsStr = buildCanonicalParams(originalSearchParams);

    const path = `/${langCode || "en"}/ads`;
    const canonicalUrl = `${baseUrl}${path}${paramsStr ? `?${paramsStr}` : ""}`;

    const languages = {};
    supportedLangs.forEach((lng) => {
      languages[lng] = `${baseUrl}/${lng}/ads${paramsStr ? `?${paramsStr}` : ""}`;
    });

    return {
      title,
      description,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          ...languages,
          "x-default": `${baseUrl}/${defaultLangCode}/ads${paramsStr ? `?${paramsStr}` : ""}`,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};


const AdsPage = async ({ params, searchParams }) => {
  const { lang: langCode } = await params;
  const { category } = await searchParams;

  let seoData = null;

  if (category) {
    seoData = await getCategorySeoData(category, langCode);
  } else {
    seoData = await fetchSeoData({ page: "ad-listing", langCode });
  }

  let schema = null;
  if (seoData?.translated_schema) {
    try {
      schema = JSON.parse(seoData.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for ads schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <Ads />
    </>
  );
};
export default AdsPage;
