import { Badge } from "@/components/ui/badge";
import { IoIosCloseCircle } from "react-icons/io";
import { BreadcrumbPathData } from '@/redux/reducer/breadCrumbSlice';
import { useAdsFilters } from "../Hooks/useAdsFilters";
import { useSelector } from "react-redux";
import { t } from "@/utils";
import { useParams } from "next/navigation";

const ActiveFilters = ({ customFields, extraDetails, featuredTitle, setExtraDetails }) => {

    const { lang } = useParams();

    const {
        query, country, state, city, areaId, location,
        km_range, date_posted, min_price, max_price, featured_section,
        initialExtraDetails, searchParams
    } = useAdsFilters();

    const newSearchParams = new URLSearchParams(searchParams);

    // 2. Add Redux for Breadcrumb (to get the category name)
    const BreadcrumbPath = useSelector(BreadcrumbPathData);
    const category = BreadcrumbPath.length > 1 && BreadcrumbPath[BreadcrumbPath.length - 1]?.name;

    // 3. Logic for price
    const isMinPrice = min_price !== "" && min_price !== null && Number(min_price) >= 0;

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;

        // Location filter
        if (country || state || city || areaId) count++;

        // KM Range filter
        if (km_range) count++;

        if (category) count++;

        if (featured_section) count++;

        // Query filter
        if (query) count++;

        // Date Posted filter
        if (date_posted) count++;

        // Price Range filter
        if (isMinPrice && max_price) count++;

        // Extra Details filters
        if (initialExtraDetails && Object.keys(initialExtraDetails).length > 0) {
            count += Object.keys(initialExtraDetails).length;
        }

        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    const postedSince =
        date_posted === "all-time"
            ? t("allTime")
            : date_posted === "today"
                ? t("today")
                : date_posted === "within-1-week"
                    ? t("within1Week")
                    : date_posted === "within-2-week"
                        ? t("within2Weeks")
                        : date_posted === "within-1-month"
                            ? t("within1Month")
                            : date_posted === "within-3-month"
                                ? t("within3Months")
                                : "";

    const handleClearLocation = () => {
        newSearchParams.delete("country");
        newSearchParams.delete("state");
        newSearchParams.delete("city");
        newSearchParams.delete("area");
        newSearchParams.delete("areaId");
        newSearchParams.delete("lat");
        newSearchParams.delete("lng");
        newSearchParams.delete("km_range");
        newSearchParams.delete("location");
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearRange = () => {
        newSearchParams.delete("km_range");
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearDatePosted = () => {
        newSearchParams.delete("date_posted");
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearBudget = () => {
        newSearchParams.delete("min_price");
        newSearchParams.delete("max_price");
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearFeaturedSection = () => {
        newSearchParams.delete("featured_section");
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearCategory = () => {
        newSearchParams.delete("category");
        Object.keys(extraDetails || {})?.forEach((key) => {
            newSearchParams.delete(key);
        });
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearExtraDetail = (keyToRemove) => {
        const updatedExtraDetails = { ...extraDetails };
        delete updatedExtraDetails[keyToRemove];
        setExtraDetails(updatedExtraDetails);
        newSearchParams.delete(keyToRemove);
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearAll = () => {

        const paramsToDelete = ["country", "state", "city", "area", "areaId", "lat", "lng", "km_range", "location", "date_posted", "min_price", "max_price", "category", "query", "featured_section"];

        paramsToDelete.forEach((param) => {
            newSearchParams.delete(param);
        });

        Object.keys(initialExtraDetails || {})?.forEach((key) => {
            newSearchParams.delete(key);
        });
        setExtraDetails({});
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };

    const handleClearQuery = () => {
        newSearchParams.delete("query");
        window.history.pushState(null, "", `/${lang}/ads?${newSearchParams.toString()}`);
    };


    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 flex-wrap">
                {category && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span className="break-all">
                            {t("category")}: {category}
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearCategory}
                        />
                    </Badge>
                )}

                {query && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span>
                            {t("search")}: {query}
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearQuery}
                        />
                    </Badge>
                )}

                {location && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span>
                            {t("location")}:{" "}
                            {location}
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearLocation}
                        />
                    </Badge>
                )}
                {Number(km_range) > 0 && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span>
                            {t("nearByRange")}: {km_range} KM
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearRange}
                        />
                    </Badge>
                )}

                {date_posted && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span>
                            {t("datePosted")}: {postedSince}
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearDatePosted}
                        />
                    </Badge>
                )}

                {isMinPrice && max_price && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span>
                            {t("budget")}: {min_price}-{max_price}
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearBudget}
                        />
                    </Badge>
                )}

                {featured_section && (
                    <Badge
                        variant="outline"
                        className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                    >
                        <span className="break-all">
                            {t("featuredSection")}: {featuredTitle}
                        </span>
                        <IoIosCloseCircle
                            size={22}
                            className="cursor-pointer "
                            onClick={handleClearFeaturedSection}
                        />
                    </Badge>
                )}
                {initialExtraDetails &&
                    Object.entries(initialExtraDetails || {}).map(
                        ([key, value]) => {
                            const field = customFields.find(
                                (f) => f.id.toString() === key.toString()
                            );

                            const fieldName = field?.translated_name || field?.name;

                            // Function to get translated value
                            const getTranslatedValue = (val) => {
                                if (!field?.values || !field?.translated_value)
                                    return val;
                                const idx = field.values.indexOf(val);
                                return idx !== -1 ? field.translated_value[idx] : val;
                            };

                            const displayValue = Array.isArray(value)
                                ? value.map((v) => getTranslatedValue(v)).join(", ")
                                : getTranslatedValue(value);

                            return (
                                <Badge
                                    key={key}
                                    variant="outline"
                                    className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted"
                                >
                                    <span>
                                        {fieldName}: {displayValue}
                                    </span>
                                    <IoIosCloseCircle
                                        size={22}
                                        className="cursor-pointer"
                                        onClick={() => handleClearExtraDetail(key)}
                                    />
                                </Badge>
                            );
                        }
                    )}
            </div>
            {activeFilterCount > 1 && (
                <button
                    className="text-primary whitespace-nowrap"
                    onClick={handleClearAll}
                >
                    {t("clearAll")}
                </button>
            )}
        </div>
    )
}

export default ActiveFilters