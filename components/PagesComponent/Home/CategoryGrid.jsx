"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CustomLink from "@/components/Common/CustomLink";
import CustomImage from "@/components/Common/CustomImage";
import { useUpdateLocationInUrl } from "@/components/Hooks/useUpdateLocationInUrl";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryApi } from "@/utils/api";
import { t } from "@/utils";

// Mobile: two rows that scroll sideways (bleeds past the container padding).
// md+: rows wrap, columns auto-fill so the gap stays tight on wide screens.
const GRID_CLASS = [
  "grid gap-x-4 gap-y-4",
  "grid-rows-2 grid-flow-col auto-cols-[72px]",
  "overflow-x-auto scrollbar-none -mx-4 px-4",
  "md:grid-rows-none md:grid-flow-row md:auto-cols-auto",
  "md:grid-cols-[repeat(auto-fill,minmax(110px,1fr))]",
  "md:gap-x-2 md:gap-y-6 md:overflow-visible md:mx-0 md:px-0",
].join(" ");

const TILE_CLASS = "w-16 sm:w-[72px] aspect-square rounded-2xl";

const CategoryGridSkeleton = () => (
  <section className="container mt-6 sm:mt-12">
    <Skeleton className="w-40 h-6" />
    <div className={`${GRID_CLASS} mt-6`}>
      {Array.from({ length: 16 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center gap-2 sm:gap-3">
          <Skeleton className={TILE_CLASS} />
          <Skeleton className="w-3/4 h-3" />
        </div>
      ))}
    </div>
  </section>
);

const CategoryGrid = () => {
  const { lang: langCode } = useParams();
  const { generateAdsUrl } = useUpdateLocationInUrl();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const first = await categoryApi.getCategory({ page: 1 });
        if (first?.data?.error !== false) return;

        const { data: firstPage = [], last_page: lastPage = 1 } =
          first.data.data || {};

        const restPages = await Promise.all(
          Array.from({ length: Math.max(lastPage - 1, 0) }, (_, i) =>
            categoryApi
              .getCategory({ page: i + 2 })
              .then((res) =>
                res?.data?.error === false ? res.data.data?.data || [] : []
              )
              .catch(() => [])
          )
        );

        if (!cancelled) setCategories([...firstPage, ...restPages.flat()]);
      } catch (error) {
        console.error("Categories error:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [langCode]);

  if (isLoading) return <CategoryGridSkeleton />;
  if (!categories.length) return null;

  return (
    <section className="container mt-6 sm:mt-12">
      <h5 className="text-xl sm:text-2xl font-medium">{t("allCategories")}</h5>
      <div className={`${GRID_CLASS} mt-6`}>
        {categories.map((item) => (
          <CustomLink
            key={item?.id}
            href={generateAdsUrl({ category: item?.slug }, true)}
            className="group flex flex-col items-center gap-2 sm:gap-3"
          >
            <div
              className={`${TILE_CLASS} bg-muted p-2.5 sm:p-3 transition-shadow group-hover:shadow-md`}
            >
              <CustomImage
                src={item?.image}
                width={72}
                height={72}
                className="w-full h-full object-contain"
                alt={item?.translated_name || "Category"}
                loading="eager"
              />
            </div>
            <p className="text-[11px] sm:text-xs line-clamp-2 font-medium text-center leading-tight">
              {item?.translated_name}
            </p>
          </CustomLink>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
