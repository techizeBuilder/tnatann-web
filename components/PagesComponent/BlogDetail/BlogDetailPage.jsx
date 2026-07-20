"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { setBreadcrumbPath } from "@/redux/reducer/breadCrumbSlice";
import { formatDateMonthYear, t, truncate } from "@/utils";
import { getBlogsApi, setBlogFeedbackApi } from "@/utils/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import parse from "html-react-parser";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import { useParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import BlogCard from "../LandingPage/BlogCard";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { getCompanyName } from "@/redux/reducer/settingSlice";
import { getIsLoggedIn } from "@/redux/reducer/authSlice";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import PopularPosts from "../Blogs/PopularPosts";
import NoData from "@/components/EmptyStates/NoData";
import PageLoader from "@/components/Common/PageLoader";
import CustomImage from "@/components/Common/CustomImage";
import AdUnit from "@/components/AdSense/AdUnit";
import { CalendarCheckIcon, EyeIcon, FacebookLogoIcon, LinkIcon, ThumbsDownIcon, ThumbsUpIcon, WhatsappLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import PopularBlogCategories from "../Blogs/PopularBlogCategories";
import Tags from "../Blogs/Tags";

const BlogDetailPage = ({ slug }) => {
  const path = usePathname();
  const dispatch = useDispatch();
  const CompanyName = useSelector(getCompanyName);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const [blogData, setBlogData] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${path}`;
  const [popularCategories, setPopularCategories] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const { lang: langCode } = useParams();

  useEffect(() => {
    getBlogsData();
  }, [langCode]);

  const getBlogsData = async () => {
    try {
      setIsLoading(true);
      const res = await getBlogsApi.getBlogs({ slug: slug, views: 1 });
      setBlogData(res?.data?.data?.data[0]);
      const title = res?.data?.data?.data[0]?.title;
      dispatch(
        setBreadcrumbPath([
          {
            name: t("ourBlogs"),
            slug: "/blogs",
          },
          {
            name: truncate(title, 30),
          },
        ])
      );
      setRelatedBlogs(res?.data?.related_articles);
      setPopularCategories(res?.data?.popular_categories || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (is_useful) => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    if (!blogData?.id) return;
    const prev = { ...blogData };
    const toggling = blogData?.user_feedback === is_useful;
    setBlogData((b) => ({
      ...b,
      user_feedback: toggling ? null : is_useful,
      useful_count: b.useful_count + (is_useful === 1 ? (toggling ? -1 : 1) : b.user_feedback === 1 ? -1 : 0),
      not_useful_count: b.not_useful_count + (is_useful === 0 ? (toggling ? -1 : 1) : b.user_feedback === 0 ? -1 : 0),
    }));
    try {
      setFeedbackLoading(true);
      const res = await setBlogFeedbackApi.setBlogFeedback({ blog_id: blogData?.id, is_useful: toggling ? null : is_useful });
      if (res?.data?.error === false) {
        // optimistic state already applied
      } else {
        setBlogData(prev);
        toast.error(res?.data?.message || t("somethingWentWrong"));
      }
    } catch (error) {
      setBlogData(prev);
      console.log(error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success(t("copyToClipboard"));
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <Layout>
      <BreadCrumb />
      <div className="container">
        <div className="flex flex-col mt-8 gap-12">
          <div className="grid md:grid-cols-12 grid-col-1 gap-6">
            {isLoading ? (
              <div className="col-span-1 md:col-span-8">
                <PageLoader />
              </div>
            ) : blogData ? (
              <div className="col-span-1 md:col-span-8 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="bg-muted w-fit py-1 px-3 rounded text-sm text-primary">{blogData?.category?.translated_name}</span>
                  <h1 className="text-3xl font-medium">
                    {blogData?.translated_title || blogData?.title}
                  </h1>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center flex-wrap gap-2 opacity-60 text-sm">
                    <div className="flex items-center gap-1">
                      <EyeIcon size={16} weight="fill" />
                      {t("views")}: {blogData?.views}
                    </div>
                    <div className="border-r h-4"></div>
                    <div className="flex gap-2 items-center">
                      <CalendarCheckIcon size={16} weight="bold" />
                      {t("postedOn")}: {formatDateMonthYear(blogData?.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-sm whitespace-nowrap">{t("shareThis")}</span>
                    <button className="border-none" onClick={handleCopyUrl}>
                      <LinkIcon size={24} />
                    </button>
                    <FacebookShareButton
                      url={currentUrl}
                      title={currentUrl + CompanyName}
                      hashtag={CompanyName}
                    >
                      <FacebookLogoIcon size={24} />
                    </FacebookShareButton>
                    <TwitterShareButton url={currentUrl}>
                      <XLogoIcon size={24} />
                    </TwitterShareButton>
                    <WhatsappShareButton
                      url={currentUrl}
                      title={
                        blogData?.translated_title ||
                        blogData?.title + "" + " - " + "" + CompanyName
                      }
                      hashtag={CompanyName}
                    >
                      <WhatsappLogoIcon size={24} />
                    </WhatsappShareButton>
                  </div>

                </div>
                <CustomImage
                  src={blogData?.image}
                  alt={blogData?.title || "Blog Image"}
                  height={838}
                  width={500}
                  className="w-full h-auto aspect-838/500 rounded-lg"
                />
                <div className="max-w-full prose lg:prose-lg">
                  {parse(
                    blogData?.translated_description ||
                    blogData?.description ||
                    ""
                  )}
                </div>
                <div className="border-t pt-4 flex items-center justify-between">

                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <p className="text-muted-foreground">
                      {t('isThisBlogHelpful')}
                    </p>

                    <div className="flex items-center gap-1">
                      <button onClick={() => handleFeedback(1)} disabled={feedbackLoading} className={blogData?.user_feedback === 1 ? "text-primary" : ""}>
                        <ThumbsUpIcon size={16} weight={blogData?.user_feedback === 1 ? "fill" : "bold"} />
                      </button>
                      <p>{blogData?.useful_count ?? 0}</p>
                    </div>
                    <div className="h-4 w-px bg-current opacity-60"></div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleFeedback(0)} disabled={feedbackLoading} className={blogData?.user_feedback === 0 ? "text-primary" : ""}>
                        <ThumbsDownIcon size={16} weight={blogData?.user_feedback === 0 ? "fill" : "bold"} />
                      </button>
                      <p>{blogData?.not_useful_count ?? 0}</p>
                    </div>

                  </div>

                  <div>
                    {blogData?.translated_tags && (
                      <div className="flex gap-2 items-center flex-wrap justify-end">
                        {blogData?.translated_tags?.map((e) => (
                          <Badge
                            key={e}
                            variant="outline"
                            className="font-normal"
                          >
                            {e}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-1 md:col-span-8">
                <NoData title={t("noBlogFound")} />
              </div>
            )}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
              <PopularPosts langCode={langCode} />
              <PopularBlogCategories categories={popularCategories} isLoading={isLoading} />
              <Tags langCode={langCode} />
              <AdUnit type='square' className="mt-8 aspect-square" />
            </div>
          </div>
          {
            relatedBlogs?.length > 0 &&
            <div className="flex gap-8 flex-col">
              <h1 className="text-2xl font-medium">{t("relatedArticle")}</h1>
              <div className="grid md:grid-cols-12 grid-cols-1 gap-4">
                {
                  relatedBlogs?.map((blog, index) => (
                    <div className="md:col-span-4 col-span-12" key={index}>
                      <BlogCard blog={blog} />
                    </div>
                  ))}
              </div>
            </div>
          }
        </div>
      </div>
    </Layout>
  );
};
export default BlogDetailPage;