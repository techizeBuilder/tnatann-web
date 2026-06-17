import { cache } from "react";
import StructuredData from "@/components/Layout/StructuredData";
import AdDetails from "@/components/PagesComponent/AdDetails/AdDetails";
import { buildSeoUrls, getLanguageCodes } from "@/lib/seoApi";

const getItemData = cache(async (slug, langCode) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-item?slug=${slug}`,
      {
        headers: {
          "Content-Language": langCode || "en",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return data?.data?.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching item data:", error);
    return null;
  }
});

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;
  const { slug, lang: langCode } = await params;
  try {
    const [item, { supportedLangs, defaultLangCode }] = await Promise.all([
      getItemData(slug, langCode),
      getLanguageCodes(),
    ]);


    const title = item?.seo_detail?.translated_meta_title || item?.translated_item?.name || process.env.NEXT_PUBLIC_META_TITLE;
    const description = item?.seo_detail?.translated_meta_description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords = item?.seo_detail?.translated_meta_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS
    const image = item?.image;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `ad-details/${slug}`,
    });

    return {
      title: title || process.env.NEXT_PUBLIC_META_TITLE,
      description: description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: keywords,
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

const ProductDetailPage = async ({ params }) => {
  const { slug, lang: langCode } = await params;

  const item = await getItemData(slug, langCode);

  let schema = null;
  if (item?.seo_detail?.translated_schema) {
    try {
      schema = JSON.parse(item.seo_detail.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for ad schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <AdDetails slug={slug} langCode={langCode} />
    </>
  );
};

export default ProductDetailPage;
