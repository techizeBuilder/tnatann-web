export const SEO_REVALIDATE_SECONDS =
    (Number(process.env.NEXT_PUBLIC_SEO_REVALIDATE_MINUTES) || 60) * 60;
export const SITEMAP_REVALIDATE_SECONDS = 604800;

export const IMAGE_ACCEPT = { "image/jpeg": [".jpeg", ".jpg"], "image/png": [".png"] };

export const VIDEO_ACCEPT = {
    "video/mp4": [".mp4"],
};

// Videos above this resolution (either dimension) are ~4K+, too heavy for mid-range mobile devices to process.
export const MAX_VIDEO_DIMENSION = 3840;


export const knownParams = [
    "country",
    "state",
    "city",
    "area",
    "areaId",
    "lat",
    "lng",
    "min_price",
    "max_price",
    "date_posted",
    "km_range",
    "sort_by",
    "query",
    "location",
];

export const workProcessSteps = [
    {
        id: 1,
        title: 'listingMadeEasy',
        description: 'createAds',
    },
    {
        id: 2,
        title: "instantReach",
        description: "connectVastAudience",
    },
    {
        id: 3,
        title: "effortlessConnection",
        description: "interactSecureMessaging",
    },
    {
        id: 4,
        title: "enjoyBenefits",
        description: "reapRewards",
    },
];

export const quickLinks = [
    {
        id: 6,
        href: "/reel/latest",
        labelKey: "videoAds",
    },
    {
        id: 3,
        href: "/subscription",
        labelKey: "subscription",
    },
    {
        id: 4,
        href: "/blogs",
        labelKey: "ourBlog",
    },
    {
        id: 5,
        href: "/faqs",
        labelKey: "faqs",
    },
    {
        id: 1,
        href: "/about-us",
        labelKey: "aboutUs",
    },
    {
        id: 2,
        href: "/contact-us",
        labelKey: "contactUs",
    },
];

// Shown in the footer "Popular Locations" section. City names are proper nouns,
// so they are used as-is rather than going through translation keys.
// Edit this list to change which cities appear.
export const popularCities = [
    { id: 1, name: "Surat", state: "Gujarat", country: "India" },
    { id: 2, name: "Ahmedabad", state: "Gujarat", country: "India" },
    { id: 3, name: "Vadodara", state: "Gujarat", country: "India" },
    { id: 4, name: "Rajkot", state: "Gujarat", country: "India" },
    { id: 5, name: "Mumbai", state: "Maharashtra", country: "India" },
    { id: 6, name: "Delhi", state: "Delhi", country: "India" },
];