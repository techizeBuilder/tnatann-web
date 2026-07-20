import Ads from "@/components/PagesComponent/Ads/Ads";
import { buildSeoUrls, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";
import Layout from "@/components/Layout/Layout";

export const dynamic = "force-dynamic";

const getFeaturedSectionData = async (slug, langCode) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-featured-section?slug=${slug}`,
    {
      headers: { "Content-Language": langCode || "en" },
      next: { revalidate: SEO_REVALIDATE_SECONDS, tags: ["featured-ads"] },
    }
  );
  const data = await response.json();
  return data?.data?.[0] || null;
};

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode, slug } = await params;

  try {
    const section = await getFeaturedSectionData(slug, langCode);

    const title =
      section?.translated_name || section?.title || process.env.NEXT_PUBLIC_META_TITLE;
    const description =
      section?.translated_description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const image = section?.image || "";

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `ads/featured/${slug}`,
    });

    return {
      title,
      description,
      openGraph: {
        images: image ? [image] : [],
      },
      alternates: {
        canonical: seoUrls.canonical,
        languages: seoUrls.languages,
      },
    };
  } catch (error) {
    console.error("Error fetching featured section metadata:", error);
    return null;
  }
};

const FeaturedSectionPage = async ({ params }) => {
  const { slug } = await params;

  return (
    <>
      <StructuredData data={null} />
      <Layout>
        <Ads featuredSlug={slug} />
      </Layout>
    </>
  );
};

export default FeaturedSectionPage;
