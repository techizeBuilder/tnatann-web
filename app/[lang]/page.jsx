import Layout from "@/components/Layout/Layout";
import StructuredData from "@/components/Layout/StructuredData";
import Home from "@/components/PagesComponent/Home/Home";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/seoApi";


export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode } = await params;

  try {
    const [home, langData] = await Promise.all([
      fetchSeoData({
        page: "home",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
    });

    return {
      title:
        home?.translated_title ||
        process.env.NEXT_PUBLIC_META_TITLE,
      description:
        home?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: home?.image ? [home?.image] : [],
      },
      keywords:
        home?.translated_keywords ||
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

export default async function HomePage({ params }) {
  const { lang: langCode } = await params;
  const home = await fetchSeoData({ page: "home", langCode });

  let schema = null;
  if (home?.translated_schema) {
    try {
      schema = JSON.parse(home.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for home schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <Layout>
        <Home />
      </Layout>
    </>
  );
}
