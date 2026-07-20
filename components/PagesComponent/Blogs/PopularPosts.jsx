import NoData from "@/components/EmptyStates/NoData";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/utils";
import CustomLink from "@/components/Common/CustomLink";
import CustomImage from "@/components/Common/CustomImage";
import { getPopularBlogsApi } from "@/utils/api";
import { useEffect, useState } from "react";

const PopularPosts = ({ langCode }) => {

  const [isLoading, setIsLoading] = useState(false)
  const [popularPosts, setPopularPosts] = useState([])

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setIsLoading(true)
        const res = await getPopularBlogsApi.getPopularBlogs()
        if (res?.data?.error === false) {
          setPopularPosts(res?.data?.data?.data || [])
        } else {
          console.log('error', res?.data?.message)
        }
      } catch (error) {
        console.log('error', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPopularPosts()
  }, [langCode])


  return (
    <div className="flex flex-col border rounded-xl">
      <div className="p-4 border-b">
        <p className="font-bold">{t("popularPosts")}</p>
      </div>
      <div className="flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <PopularPostsSkeleton key={index} />
          ))
        ) : popularPosts.length > 0 ? (
          popularPosts.map((popularBlog) => (
            <CustomLink
              key={popularBlog?.id}
              href={`/blogs/${popularBlog?.slug}`}
              className="flex gap-3 px-4 py-2 items-center"
            >
              <CustomImage
                src={popularBlog?.image}
                alt={popularBlog?.title}
                height={48}
                width={64}
                className="aspect-64/48 rounded object-cover"
              />
              <p className="line-clamp-3 font-medium">
                {popularBlog?.translated_title || popularBlog?.title}
              </p>
            </CustomLink>
          ))
        ) : (
          <div className="col-span-full">
            <NoData title={t("noPopularPostsFound")} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularPosts;

const PopularPostsSkeleton = () => {
  return (
    <div className="flex gap-3 px-4 py-2 items-center">
      <Skeleton className="h-12 w-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};
