import PrivacyPolicy from "@/components/PagesComponent/StaticPages/PrivacyPolicy";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [privacyPolicy, langData] = await Promise.all([
      fetchSeoData({
        page: "privacy-policy",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "privacy-policy",
    });

    return {
      title:
        privacyPolicy?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        privacyPolicy?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: privacyPolicy?.image ? [privacyPolicy?.image] : [],
      },
      keywords:
        privacyPolicy?.translated_keywords ||
        process.env.NEXT_PUBLIC_META_kEYWORDS,
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

const PrivacyPolicyPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const privacyPolicy = await fetchSeoData({ page: "privacy-policy", langCode });

  let schema = null;
  if (privacyPolicy?.translated_schema) {
    try {
      schema = JSON.parse(privacyPolicy.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for privacy-policy schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <PrivacyPolicy />
    </>
  );
};
export default PrivacyPolicyPage;
