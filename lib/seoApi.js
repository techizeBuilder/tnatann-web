import { SEO_REVALIDATE_SECONDS } from "./constants";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const getLanguageCodes = async () => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-system-languages-codes`,
            {
                next: {
                    revalidate: SEO_REVALIDATE_SECONDS,
                },
            }
        );
        const data = await res.json();

        const defaultLangCode = (
            data?.data?.default_language_code || "en"
        ).toLowerCase();

        const supportedLangs = (
            data?.data?.language_codes || []
        ).map((lng) => lng.toLowerCase());

        // ✅ Direct append (only if not already present)
        if (!supportedLangs.includes(defaultLangCode)) {
            supportedLangs.push(defaultLangCode);
        }

        return { supportedLangs, defaultLangCode };
    } catch (error) {
        console.log("error", error);
        return {
            supportedLangs: ["en"],
            defaultLangCode: "en",
        };
    }
};

export const fetchSeoData = async ({ page, langCode }) => {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}seo-settings?page=${page}`,
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
    return data?.data?.[0] || null;
};

export const buildSeoUrls = ({
    supportedLangs,
    defaultLangCode,
    langCode,
    pagePath = "",
}) => {
    const normalizedLang = langCode || "en";

    const path = pagePath
        ? `/${normalizedLang}/${pagePath}`
        : `/${normalizedLang}`;

    const languages = supportedLangs.reduce((acc, lng) => {
        acc[lng] = pagePath
            ? `${baseUrl}/${lng}/${pagePath}`
            : `${baseUrl}/${lng}`;
        return acc;
    }, {});

    return {
        path,
        canonical: `${baseUrl}${path}`,
        languages: {
            ...languages,
            "x-default": pagePath
                ? `${baseUrl}/${defaultLangCode}/${pagePath}`
                : `${baseUrl}/${defaultLangCode}`,
        },
    };
};

export const getKeywords = (seoKeywords, fallback) => {
  if (!seoKeywords) return fallback;
  try {
    const parsed = JSON.parse(seoKeywords).map(item => item.value);
    return parsed.length ? parsed.join(", ") : fallback;
  } catch {
    return fallback;
  }
};