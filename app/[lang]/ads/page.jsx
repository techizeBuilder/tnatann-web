import Ads from "@/components/PagesComponent/Ads/Ads";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";
import Layout from "@/components/Layout/Layout";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params, searchParams }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode } = await params;

  try {
    const adListing = await fetchSeoData({ page: "ad-listing", langCode });

    const title =
      adListing?.translated_title || process.env.NEXT_PUBLIC_META_TITLE;
    const description =
      adListing?.translated_description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords =
      adListing?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS;
    const image = adListing?.image || "";

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "ads",
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
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const AdsPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const seoData = await fetchSeoData({ page: "ad-listing", langCode });

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
      <Layout>
        <Ads />
      </Layout>
    </>
  );
};

export default AdsPage;
