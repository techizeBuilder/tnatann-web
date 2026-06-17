import ProductDetail from "@/components/PagesComponent/AdDetails/AdDetails";

const getItemData = async (slug, langCode) => {
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
};

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;
  const { slug, lang: langCode } = await params;
  try {
    const item = await getItemData(slug, langCode)
    const title = item?.seo_detail?.translated_meta_title || item?.translated_item?.name;
    const description = item?.seo_detail?.translated_meta_description || item?.translated_item?.description;
    const keywords = item?.seo_detail?.translated_meta_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS;
    const image = item?.image;

    return {
      title: title || process.env.NEXT_PUBLIC_META_TITLE,
      description: description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: keywords,
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const MyListingPage = async ({ params }) => {
  const { slug, lang: langCode } = await params;
  return (
    <ProductDetail slug={slug} langCode={langCode} />
  );
};

export default MyListingPage;
