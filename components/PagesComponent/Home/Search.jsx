"use client";
import { CircleNotchIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { t } from "@/utils";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useNavigate } from "@/components/Hooks/useNavigate";
import { useUpdateLocationInUrl } from "@/components/Hooks/useUpdateLocationInUrl";
import { knownParams } from "@/lib/constants";
import { allItemApi } from "@/utils/api";
import CustomImage from "@/components/Common/CustomImage";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";

const searchExamples = ["Mobiles", "Cars", "Bikes", "Furniture", "Electronics", "Property"];

const Search = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const { navigate, pushState } = useNavigate();
  const { categorySlug } = useParams();
  const currentCategoryPath = categorySlug ? categorySlug.join("/") : "";
  const [searchQuery, setSearchQuery] = useState(query);
  const { generateAdsUrl } = useUpdateLocationInUrl();
  const userData = useSelector(userSignUpData);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchExamples.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  const dynamicPlaceholder = `${t("search")} "${searchExamples[placeholderIndex]}"`;

  // Live suggestions
  const [debouncedQuery] = useDebounce(searchQuery, 400);
  const [suggestState, setSuggestState] = useState({
    items: [],
    loading: false,
    show: false,
  });
  const isSuggestionClick = useRef(false);

  useEffect(() => {
    if (isSuggestionClick.current) {
      isSuggestionClick.current = false;
      return;
    }
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setSuggestState({ items: [], loading: false, show: false });
        return;
      }
      setSuggestState((prev) => ({ ...prev, loading: true, show: true }));
      try {
        const response = await allItemApi.getItems({
          search: debouncedQuery,
          limit: 5,
        });
        const items = response?.data?.data?.data || [];
        setSuggestState({ items, loading: false, show: true });
      } catch (error) {
        setSuggestState({ items: [], loading: false, show: true });
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearchNav = (e) => {
    e.preventDefault();
    setSuggestState((prev) => ({ ...prev, show: false }));
    const isFeaturedPage = pathname.includes("/ads/featured/");
    const isAdsPage = pathname.includes("/ads") && !isFeaturedPage;

    const stayOnCurrentPage =
      (isFeaturedPage && !currentCategoryPath) ||
      (isAdsPage && !currentCategoryPath);

    if (stayOnCurrentPage) {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (knownParams.includes(key)) params.set(key, value);
      });
      if (searchQuery) params.set("query", searchQuery);
      else params.delete("query");
      pushState(`/ads${currentCategoryPath ? `/${currentCategoryPath}` : ""}?${params.toString()}`);
    } else {
      navigate(generateAdsUrl({ query: searchQuery }, !isAdsPage));
    }
  };

  const handleSuggestionClick = (item) => {
    isSuggestionClick.current = true;
    setSuggestState((prev) => ({ ...prev, show: false }));
    const productLink =
      userData?.id === item?.user_id
        ? `/my-listing/${item?.slug}`
        : `/ad-details/${item?.slug}`;
    navigate(productLink);
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSearchNav}
        className="w-full flex items-center gap-2 py-1 px-2 sm:py-1.5 sm:px-2.5"
      >
        <MagnifyingGlassIcon className="size-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder={dynamicPlaceholder}
          className="text-sm outline-hidden w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestState.items.length > 0) {
              setSuggestState((prev) => ({ ...prev, show: true }));
            }
          }}
          onBlur={() =>
            setSuggestState((prev) => ({ ...prev, show: false }))
          }
        />
        <button
          className="flex items-center justify-center shrink-0 bg-primary text-white size-8 rounded-full"
          type="submit"
        >
          <MagnifyingGlassIcon size={14} weight="bold" />
        </button>
      </form>

      {suggestState.show && (
        <div className="absolute top-full left-0 right-0 z-1500 mt-2 max-h-80 overflow-y-auto rounded-lg border bg-white shadow-lg">
          {suggestState.loading ? (
            <div className="flex justify-center items-center py-4 text-muted-foreground">
              <CircleNotchIcon className="animate-spin" weight="bold" />
            </div>
          ) : suggestState.items.length > 0 ? (
            suggestState.items.map((item) => (
              <button
                key={item?.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(item)}
                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted"
              >
                <CustomImage
                  src={item?.image}
                  width={40}
                  height={40}
                  className="size-10 rounded object-cover shrink-0"
                  alt={item?.translated_item?.name || item?.name || "Product"}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">
                    {item?.translated_item?.name || item?.name}
                  </span>
                  {item?.formatted_price && (
                    <span className="text-xs text-muted-foreground">
                      {item?.formatted_price}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-center text-muted-foreground">
              {t("noAdsFound")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
