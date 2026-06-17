import BlogDetailPage from "@/components/PagesComponent/BlogDetail/BlogDetailPage";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";
import { buildSeoUrls, getKeywords, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";

const getBlogData = async (slug, langCode) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}blogs?slug=${slug}`,
    {
      headers: {
        "Content-Language": langCode || "en",
      },
      next: {
        revalidate: SEO_REVALIDATE_SECONDS,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blog data");
  }

  const responseData = await response.json();
  return responseData?.data?.data[0];
};

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { slug, lang: langCode } = await params;

    const [data, langData] = await Promise.all([
      getBlogData(slug, langCode),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `blogs/${slug}`,
    });

    return {
      title: data?.seo_detail?.translated_meta_title || data?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description: data?.seo_detail?.translated_meta_description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: data?.image ? [data?.image] : [],
      },
      keywords: getKeywords(data?.seo_detail?.translated_meta_keywords, data?.translated_tags || process.env.NEXT_PUBLIC_META_kEYWORDS),
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

const BlogPage = async ({ params }) => {
  const { slug, lang: langCode } = await params;
  const data = await getBlogData(slug, langCode);
  let schema = null;
  if (data?.seo_detail?.translated_schema) {
    try {
      schema = JSON.parse(data.seo_detail.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for blog schema:", e);
    }
  }
  return (
    <>
      <StructuredData data={schema} />
      <BlogDetailPage slug={slug} />
    </>
  );
};

export default BlogPage;
