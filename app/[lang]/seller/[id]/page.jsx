import Seller from "@/components/PagesComponent/Seller/Seller";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";
import { buildSeoUrls, getLanguageCodes } from "@/lib/seoApi";
import StructuredData from "@/components/Layout/StructuredData";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { id, lang: langCode } = await params;
    const [res, langData] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-seller?id=${id}`,
        {
          next: {
            revalidate: SEO_REVALIDATE_SECONDS,
          },
        }
      ),
      getLanguageCodes(),
    ]);

    const data = await res.json();
    const seller = data?.data?.seller;
    const title = seller?.name;
    const image = seller?.profile;

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `seller/${id}`,
    });

    return {
      title: title ? title : process.env.NEXT_PUBLIC_META_TITLE,
      description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
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
const getSellerItems = async (id, langCode) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-item?page=1&user_id=${id}`,
      {
        headers: {
          "Content-Language": langCode || "en",
        },
        next: {
          revalidate: SEO_REVALIDATE_SECONDS,
        },
      }
    );
    const data = await res.json();
    return data?.data?.data || [];
  } catch (error) {
    console.error("Error fetching Product Items Data:", error);
    return [];
  }
};

const SellerPage = async ({ params, searchParams }) => {
  const { id, lang: langCode } = await params;
  const originalSearchParams = await searchParams;
  const sellerItems = await getSellerItems(id, langCode);

  const jsonLd = sellerItems?.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: sellerItems.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            productID: product?.id,
            name: product?.translated_item?.name,
            description: product?.translated_item?.description,
            image: product?.image,
            url: `${process.env.NEXT_PUBLIC_WEB_URL}/ad-details/${product?.slug}`,
            category: {
              "@type": "Thing",
              name: product?.category?.translated_name,
            },
            offers: {
              "@type": "Offer",
              price: product?.price,
              priceCurrency: "USD",
            },
            countryOfOrigin: product?.country,
          },
        })),
      }
    : null;

  return (
    <>
      <StructuredData data={jsonLd} />
      <Seller id={id} searchParams={originalSearchParams} />
    </>
  );
};

export default SellerPage;
