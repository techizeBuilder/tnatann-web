'use client'
import { useEffect, useState } from "react"
import { toast } from "sonner"
import CustomImage from "@/components/Common/CustomImage"
import NoData from "@/components/EmptyStates/NoData"
import Layout from "@/components/Layout/Layout"
import { Button } from "@/components/ui/button"
import { t } from "@/utils"
import { categoryApi, getParentCategoriesApi } from "@/utils/api"
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb"
import BuyPackage from "./BuyPackage"
import { getIsFreAdListing } from "@/redux/reducer/settingSlice"
import FreeAdListingPlaceholder from "./FreeAdListingPlaceholder"
import { getIsLoggedIn } from "@/redux/reducer/authSlice"
import { useSelector } from "react-redux"
import { useParams, useSearchParams } from "next/navigation"
import Loader from "@/components/Common/Loader"
import { ArrowLeftIcon, CaretRightIcon, GlobeIcon, PencilSimpleLineIcon } from "@phosphor-icons/react"

const CategorySelectionSubscription = () => {
    const searchParams = useSearchParams();
    const isFeaturedPlan = searchParams.get("plan") === "featured";
    const isLoggedIn = useSelector(getIsLoggedIn)
    const isFreeAdListing = useSelector(getIsFreAdListing)
    const { lang: langCode } = useParams();
    const [categories, setCategories] = useState([])
    const [selfCategoryPackagesCount, setSelfCategoryPackagesCount] = useState(0)
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [isLoadMoreCat, setIsLoadMoreCat] = useState(false)
    const [categoryPath, setCategoryPath] = useState([])
    const [currentPage, setCurrentPage] = useState()
    const [lastPage, setLastPage] = useState()
    const [selectedCategory, setSelectedCategory] = useState({
        isSelected: false,
        category: null
    })
    useEffect(() => {
        setCategoryPath([]);
        setSelectedCategory({ isSelected: false, category: null });
        handleFetchCategories(null, "forward", 1);
    }, [langCode, isLoggedIn]);

    useEffect(() => {
        const categoryId = searchParams.get("category_id");
        if (categoryId) {
            fetchAndSetCategory(categoryId);
        }
    }, []);

    const fetchAndSetCategory = async (id) => {
        try {
            setCategoriesLoading(true);
            const res = await getParentCategoriesApi.getPaymentCategories({
                child_category_id: id,
            });
            if (res?.data?.error === false) {
                const path = res?.data?.data;
                if (path?.length > 0) {
                    if (path.length > 1) {
                        const parentCategory = path[path.length - 2]; // Headphones
                        await handleFetchCategories(parentCategory, "sync", 1);
                    }
                    const category = path[path.length - 1]; // The selected category
                    setSelectedCategory({
                        isSelected: true,
                        category: category
                    });
                    // Set the parent hierarchy so breadcrumbs work
                    setCategoryPath(path.slice(0, -1));
                    // ONLY fetch siblings if we are deep inside a subcategory
                }
            }
        } catch (error) {
            console.log("Error pre-selecting category:", error);
        } finally {
            setCategoriesLoading(false); // 2. Stop loading UI
        }
    }

    /**
     * Handles clicking on category
     */
    const handleCategoryTabClick = (category) => {
        if (category?.subcategories_count > 0) {
            handleFetchCategories(category, "forward")
        } else {
            setSelectedCategory({
                isSelected: true,
                category
            })
        }
    }
    /**
     * Fetch categories
     * navigationType:
     *  - forward
     *  - backward
     */
    const handleFetchCategories = async (
        category = null,
        navigationType = "forward",
        page = 1
    ) => {
        if (page > 1) {
            setIsLoadMoreCat(true);
        } else {
            setCategoriesLoading(true);
        }
        try {
            const categoryId = category ? category.id : null
            const res = await categoryApi.getCategory({
                category_id: categoryId,
                page
            })
            if (res?.data?.error === false) {
                const responseData = res?.data?.data
                page > 1 ? setCategories(prev => [...prev, ...responseData?.data]) : setCategories(responseData?.data || [])
                setCurrentPage(responseData?.current_page)
                setLastPage(responseData?.last_page)
                setSelfCategoryPackagesCount(res?.data?.self_category?.packages_count || 0)
                // Manage path
                if (navigationType === "forward" && page === 1 && category) {
                    setCategoryPath(prev => [...prev, category])
                }

                if (navigationType === "backward") {
                    setCategoryPath(prev => prev.slice(0, -1))
                }
            } else {
                toast.error(res?.data?.message)
            }
        } catch (error) {
            console.log("Category fetch error:", error)
            toast.error("Something went wrong")
        } finally {
            setCategoriesLoading(false)
            setIsLoadMoreCat(false)
        }
    }

    /**
     * Back Button Logic
     */
    const handleBack = () => {
        const previousCategory =
            categoryPath[categoryPath.length - 2] || null

        handleFetchCategories(previousCategory, "backward")
    }


    const handleLoadMore = () => {
        setIsLoadMoreCat(true)
        const currentCategory = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;
        handleFetchCategories(currentCategory, "forward", currentPage + 1)
    }

    return (
        <Layout>
            <BreadCrumb title2={t("subscription")} />
            {

                isFeaturedPlan ? (
                    <BuyPackage categoryId={null} isFeaturedPlan={isFeaturedPlan} />
                ) : isFreeAdListing ? (
                    <div className="container">
                        <FreeAdListingPlaceholder />
                    </div>
                ) :
                    selectedCategory.isSelected ?
                        <>
                            <div className="container">
                                <h1 className="mt-8 sectionTitle">{t('selectSubscriptionPlan')}</h1>
                                <div className="p-4 border rounded-lg mt-8">
                                    <div className="flex items-center justify-between gap-2" >
                                        <div className="flex items-center gap-2">
                                            <div className="size-11.25 bg-muted flex items-center justify-center rounded-full">
                                                {
                                                    selectedCategory.category ?
                                                        <CustomImage
                                                            width={28}
                                                            height={28}
                                                            src={selectedCategory?.category?.image}
                                                            alt={selectedCategory?.category?.translated_name}
                                                            className="object-contain aspect-square"
                                                        />
                                                        :
                                                        <GlobeIcon className="text-primary size-6" />
                                                }
                                            </div>
                                            <p>{selectedCategory.category ? selectedCategory?.category?.translated_name : t("globalPackage")}</p>
                                        </div>
                                        <button onClick={() => setSelectedCategory({ isSelected: false, category: null })}>
                                            <PencilSimpleLineIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <BuyPackage categoryId={selectedCategory?.category?.id} isFeaturedPlan={isFeaturedPlan} />
                        </>
                        :
                        <div className="container mt-8">
                            <h1 className="sectionTitle">
                                {t('selectACategory')}
                            </h1>
                            <div className="p-4 border mt-8 rounded-md">
                                {
                                    categoryPath?.length > 0 ?
                                        <div className="flex items-center gap-3 mb-6">
                                            <button
                                                onClick={handleBack}
                                                className="flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors"
                                                aria-label={t("back")}
                                                disabled={categoriesLoading || isLoadMoreCat}
                                            >
                                                <ArrowLeftIcon size={20} className="rtl:scale-x-[-1]" weight="bold" />
                                            </button>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                {categoryPath?.map((item, index) => {
                                                    return (
                                                        <span key={item?.id} className="text-primary">
                                                            {index > 0 && ", "}
                                                            {item?.translated_name || item?.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        :
                                        <button
                                            className="sm:bg-muted sm:p-3 rounded mb-6 border-primary w-full text-left"
                                            onClick={() => setSelectedCategory({ isSelected: true, category: null })}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted sm:bg-white shrink-0 size-12 rounded-full flex items-center justify-center">
                                                        <GlobeIcon className="text-primary size-6" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <h5 className="font-medium">{t('globalPackage')}</h5>
                                                        <p className="text-muted-foreground text-sm">{t('availableForAllCategories')}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-black rounded p-2">
                                                    <CaretRightIcon size={20} weight="bold" className='rtl:scale-x-[-1] text-white' />
                                                </div>
                                            </div>
                                        </button>
                                }

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {categoriesLoading ? (
                                        <div className="col-span-12 py-28">
                                            <Loader className="flex justify-center" />
                                        </div>
                                    ) : categories.length > 0 ? (
                                        <>
                                            {categoryPath?.length > 0 && (
                                                <div key={`all-in-${categoryPath[categoryPath.length - 1]?.id}`}>
                                                    <button
                                                        className="flex justify-between items-center w-full"
                                                        onClick={() => setSelectedCategory({ isSelected: true, category: categoryPath[categoryPath.length - 1] })}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CustomImage
                                                                src={categoryPath[categoryPath.length - 1]?.image}
                                                                alt={categoryPath[categoryPath.length - 1]?.translated_name || categoryPath[categoryPath.length - 1]?.name}
                                                                height={48}
                                                                width={48}
                                                                className="h-12 w-12 rounded-full"
                                                            />

                                                            <div className="flex flex-col gap-1 ltr:text-left rtl:text-right">
                                                                <span className="break-all">
                                                                    {t('allIn')} {categoryPath[categoryPath.length - 1]?.translated_name || categoryPath[categoryPath.length - 1]?.name}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {selfCategoryPackagesCount} {t('packages')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                            {categories.map((category) => (
                                                <div key={category?.id}>
                                                    <button
                                                        className="flex justify-between items-center w-full"
                                                        onClick={() => handleCategoryTabClick(category)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <CustomImage
                                                                src={category?.image}
                                                                alt={category?.translated_name || category?.name}
                                                                height={48}
                                                                width={48}
                                                                className="h-12 w-12 rounded-full"
                                                            />

                                                            <div className="flex flex-col gap-1 ltr:text-left rtl:text-right">
                                                                <span className="break-all">
                                                                    {category?.translated_name || category?.name}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {category?.packages_count || 0} {t('packages')}
                                                                </span>
                                                            </div>

                                                        </div>

                                                        {category?.subcategories_count > 0 && (
                                                            <CaretRightIcon size={14} weight="bold" className="rtl:scale-x-[-1]" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="col-span-12">
                                            <NoData title={t('noCategoryFound')} />
                                        </div>
                                    )}
                                </div>

                                {/* Load More */}
                                {!categoriesLoading &&
                                    lastPage > currentPage && (
                                        <div className="text-center mt-6">
                                            <Button
                                                variant="outline"
                                                className="text-sm sm:text-base text-primary w-[256px]"
                                                disabled={isLoadMoreCat || categoriesLoading}
                                                onClick={handleLoadMore}
                                            >
                                                {isLoadMoreCat
                                                    ? t("loading")
                                                    : t("loadMore")}
                                            </Button>
                                        </div>
                                    )}
                            </div>
                        </div>
            }
        </Layout>
    )
}

export default CategorySelectionSubscription

