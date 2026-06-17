import { SITEMAP_REVALIDATE_SECONDS } from "@/lib/constants";

// Route-level segment config: regenerate the sitemap on a schedule (ISR) instead
// of forcing fully-static generation, which the build cannot do because the
// sitemap fetches live data from the backend.
export const revalidate = 604800; // 7 days, matches SITEMAP_REVALIDATE_SECONDS

export default async function sitemap() {
  const seoEnabled = process.env.NEXT_PUBLIC_SEO === "true";
  if (!seoEnabled) return [];

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let defaultLanguageCode = "en";
  let languages = [];

  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-system-settings`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );

    if (res.ok) {
      const data = await res.json();
      defaultLanguageCode = data?.data?.default_language || "en";
      languages = data?.data?.languages || [];
    }
  } catch (error) {
    console.error("Error fetching languages:", error);
    return [];
  }

  const publicRoutes = [
    "about-us",
    "ads",
    "blogs",
    "contact-us",
    "faqs",
    "landing",
    "privacy-policy",
    "refund-policy",
    "subscription",
    "terms-and-condition",
  ];

  // ✅ hreflang builder (route-based)
  const buildHreflangLinks = (path) => {
    const links = {};

    languages.forEach((lang) => {
      links[lang.code] = `${baseUrl}/${lang.code}${path}`;
    });

    links["x-default"] = `${baseUrl}/${defaultLanguageCode}${path}`;

    return { languages: links };
  };

  // ✅ HOME ENTRIES (one per language)
  const homeEntries = languages.map((lang) => ({
    url: `${baseUrl}/${lang.code}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: lang.code === defaultLanguageCode ? 1 : 0.9,
    alternates: buildHreflangLinks(""),
  }));

  // ✅ STATIC ROUTES
  const staticSitemapEntries = languages.flatMap((lang) =>
    publicRoutes.map((route) => {
      const path = `/${route}`;
      return {
        url: `${baseUrl}/${lang.code}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: buildHreflangLinks(path),
      };
    })
  );

  // ✅ ADS
  let adEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-item-slug`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );

    if (res.ok) {
      const json = await res.json();
      const products = json?.data || [];

      adEntries = products.flatMap((product) => {
        const path = `/ad-details/${product?.slug}`;

        return languages.map((lang) => ({
          url: `${baseUrl}/${lang.code}${path}`,
          lastModified: new Date(product?.updated_at),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: buildHreflangLinks(path),
        }));
      });
    }
  } catch (error) {
    console.error("Error fetching ads:", error);
  }

  // ✅ CATEGORIES
  let categoryEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-categories-slug`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );

    if (res.ok) {
      const json = await res.json();
      const categories = json?.data || [];

      categoryEntries = categories.flatMap((category) => {
        const path = `/ads?category=${category?.slug}`; // (better: /ads/category/slug)

        return languages.map((lang) => ({
          url: `${baseUrl}/${lang.code}${path}`,
          lastModified: new Date(category?.updated_at),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: buildHreflangLinks(path),
        }));
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  // ✅ BLOGS
  let blogEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-blogs-slug`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );

    if (res.ok) {
      const json = await res.json();
      const blogs = json?.data || [];

      blogEntries = blogs.flatMap((blog) => {
        const path = `/blogs/${blog?.slug}`;

        return languages.map((lang) => ({
          url: `${baseUrl}/${lang.code}${path}`,
          lastModified: new Date(blog?.updated_at),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: buildHreflangLinks(path),
        }));
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }

  // ✅ FEATURED SECTIONS
  let featuredSectionEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-featured-section-slug`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );

    if (res.ok) {
      const json = await res.json();
      const sections = json?.data || [];

      featuredSectionEntries = sections.flatMap((section) => {
        const path = `/ads?featured_section=${section?.slug}`;

        return languages.map((lang) => ({
          url: `${baseUrl}/${lang.code}${path}`,
          lastModified: new Date(section?.updated_at),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: buildHreflangLinks(path),
        }));
      });
    }
  } catch (error) {
    console.error("Error fetching featured sections:", error);
  }

  // ✅ SELLERS
  let sellerProfileEntries = [];
  try {
    const res = await fetch(
      `${apiUrl}${process.env.NEXT_PUBLIC_END_POINT}get-seller-slug`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );

    if (res.ok) {
      const json = await res.json();
      const sellers = json?.data || [];

      sellerProfileEntries = sellers.flatMap((seller) => {
        const path = `/seller/${seller?.id}`;

        return languages.map((lang) => ({
          url: `${baseUrl}/${lang.code}${path}`,
          lastModified: new Date(seller?.updated_at),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: buildHreflangLinks(path),
        }));
      });
    }
  } catch (error) {
    console.error("Error fetching sellers:", error);
  }

  return [
    ...homeEntries,
    ...staticSitemapEntries,
    ...adEntries,
    ...categoryEntries,
    ...blogEntries,
    ...featuredSectionEntries,
    ...sellerProfileEntries,
  ];
}