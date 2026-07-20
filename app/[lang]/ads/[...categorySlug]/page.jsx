import Ads from "@/components/PagesComponent/Ads/Ads";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";
import { buildSeoUrls, getKeywords, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";
import Layout from "@/components/Layout/Layout";

export const dynamic = "force-dynamic";

const getCategorySeoData = async (slug, langCode) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-categories?slug=${slug}`,
    {
      headers: { "Content-Language": langCode || "en" },
      next: { revalidate: SEO_REVALIDATE_SECONDS, tags: ["categories"] },
    }
  );
  const data = await response.json();
  return data?.self_category?.seo_detail;
};

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode, categorySlug } = await params;
  const leafSlug = categorySlug[categorySlug.length - 1];

  try {
    const seo_detail = await getCategorySeoData(leafSlug, langCode);

    const title =
      seo_detail?.translated_meta_title || process.env.NEXT_PUBLIC_META_TITLE;
    const description =
      seo_detail?.translated_meta_description ||
      process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords = getKeywords(
      seo_detail?.translated_meta_keywords,
      process.env.NEXT_PUBLIC_META_kEYWORDS
    );
    const image = seo_detail?.image || "";

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();
    const slugPath = categorySlug.join("/");
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `ads/${slugPath}`,
    });

    return {
      title,
      description,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords,
      alternates: {
        canonical: seoUrls.canonical,
        languages: seoUrls.languages,
      },
    };
  } catch (error) {
    console.error("Error fetching category metadata:", error);
    return null;
  }
};

const CategoryAdsPage = async ({ params }) => {
  const { lang: langCode, categorySlug } = await params;
  const leafSlug = categorySlug[categorySlug.length - 1];

  const seoData = await getCategorySeoData(leafSlug, langCode);

  let schema = null;
  if (seoData?.translated_schema) {
    try {
      schema = JSON.parse(seoData.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for category schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <Layout>
        <Ads />
      </Layout>
    </>
  );
};

export default CategoryAdsPage;
