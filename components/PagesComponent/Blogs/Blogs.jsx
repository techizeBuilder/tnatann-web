"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { t } from "@/utils";
import { getBlogsApi } from "@/utils/api";
import { useEffect, useState } from "react";
import BlogCardSkeleton from "@/components/Skeletons/BlogCardSkeleton";
import BlogCard from "../LandingPage/BlogCard";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import NoData from "@/components/EmptyStates/NoData";
import Tags from "./Tags";
import { useParams, useSearchParams } from "next/navigation";
import AdUnit from "@/components/AdSense/AdUnit";
import BlogCategory from "./BlogCategory";
import PopularPosts from "./PopularPosts";
import { useDispatch } from "react-redux";
import { setBreadcrumbPath } from "@/redux/reducer/breadCrumbSlice";

const Blogs = ({ categorySlug } = {}) => {
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag");
  const { lang: langCode } = useParams();
  const dispatch = useDispatch();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [categoryName, setCategoryName] = useState("")

  useEffect(() => {
    setCurrentPage(1);
    getBlogsData(1);
  }, [tag, langCode, categorySlug]);

  const getBlogsData = async (page) => {
    try {
      page > 1 ? setIsLoadMore(true) : setIsLoading(true);
      const res = await getBlogsApi.getBlogs({
        sort_by: "new-to-old",
        page,
        ...(tag && { tag }),
        ...(categorySlug && { category_slug: categorySlug }),
      });
      if (res?.data?.error === false) {

        if (page === 1) {
          const data = res?.data?.data?.data
          setBlogs(data)
          if (categorySlug) {
            const name = data?.[0]?.category?.translated_name || data?.[0]?.category?.name || res?.data?.category?.translated_name || res?.data?.category?.name
            setCategoryName(name)
            dispatch(setBreadcrumbPath([
              { name: t("ourBlogs"), slug: "/blogs" },
              { name },
            ]))
          } else {
            dispatch(setBreadcrumbPath([{ name: t("ourBlogs") }]))
          }

        } else {
          setBlogs([...blogs, ...res?.data?.data?.data]);
        }
        setCurrentPage(res?.data?.data?.current_page);
        setHasMore(res?.data?.data?.current_page < res?.data?.data?.last_page);
      } else {
        console.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  const handleLoadMore = () => {
    getBlogsData(currentPage + 1);
  };

  return (
    <Layout>
      <BreadCrumb />
      <div className="container">
        <div className="flex flex-col mt-8 gap-6">
          <h1 className="text-2xl font-medium">{categoryName ? `${categoryName} ${t("blogs")}` : t("ourBlogs")}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 ">
            <div className="lg:col-span-8 col-span-12 order-2 lg:order-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 6 })?.map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))
                ) : blogs && blogs?.length > 0 ? (
                  blogs?.map((blog) => <BlogCard key={blog?.id} blog={blog} />)
                ) : (
                  <div className="col-span-full">
                    <NoData title={t("noBlogFound")} />
                  </div>
                )}
              </div>
              {hasMore && (
                <div className="text-center mt-6 mb-2">
                  <Button
                    variant="outline"
                    className="text-sm sm:text-base text-primary w-[256px]"
                    disabled={isLoading || isLoadMore}
                    onClick={handleLoadMore}
                  >
                    {isLoadMore ? t("loading") : t("loadMore")}
                  </Button>
                </div>
              )}
            </div>
            <div className="col-span-12 lg:col-span-4 order-1 lg:order-2 flex flex-col gap-8">
              <BlogCategory langCode={langCode} />
              <Tags tag={tag} langCode={langCode} />
              <PopularPosts langCode={langCode} />
              <AdUnit type="vertical" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blogs;
