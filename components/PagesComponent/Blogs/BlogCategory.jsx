"use client";
import CustomLink from "@/components/Common/CustomLink";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/utils";
import { getBlogCategoriesApi } from "@/utils/api";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NoData from "@/components/EmptyStates/NoData";

const BlogCategory = ({ langCode }) => {
    const { blogCategorySlug: activeCategorySlug } = useParams();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        fetchCategories(1);
    }, [langCode]);

    const fetchCategories = async (page) => {
        try {
            page > 1 ? setIsLoadMore(true) : setIsLoading(true);
            const res = await getBlogCategoriesApi.getBlogCategories({ page });
            if (res?.data?.error === false) {
                const data = res?.data?.data?.data ?? [];
                page === 1
                    ? setCategories(data)
                    : setCategories((prev) => [...prev, ...data]);
                setCurrentPage(res?.data?.data?.current_page);
                setHasMore(
                    res?.data?.data?.current_page < res?.data?.data?.last_page
                );
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
            setIsLoadMore(false);
        }
    };

    const handleLoadMore = () => {
        fetchCategories(currentPage + 1);
    };

    return (
        <div className="flex flex-col border rounded-lg">
            <div className="p-4">
                <p className="font-bold">{t("category")}</p>
            </div>
            <div className="border-b w-full" />
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-1">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <NoData title={t("noCategoryFound")} />
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {categories.map((cat) => {
                            const isActive = activeCategorySlug === cat?.slug;
                            return (
                                <CustomLink
                                    href={`/blogs/category/${cat?.slug}`}
                                    key={cat?.id}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/10"}`}
                                >
                                    <span>{cat?.translated_name}</span>
                                    {!isActive && <CaretRightIcon size={14} weight="bold" className="shrink-0 text-muted-foreground" />}
                                </CustomLink>
                            );
                        })}
                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadMore}
                                className="text-sm text-primary font-medium px-2 text-left hover:underline disabled:opacity-50"
                            >
                                {isLoadMore ? t("loading") : t("viewAll")}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogCategory;
