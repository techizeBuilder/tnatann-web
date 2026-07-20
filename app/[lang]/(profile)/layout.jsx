"use client";
import ProfileSidebar from "@/components/Profile/ProfileSidebar";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import Layout from "@/components/Layout/Layout";
import BlockedUsersMenu from "@/components/PagesComponent/Chat/BlockedUsersMenu";
import Checkauth from "@/HOC/Checkauth";
import { t } from "@/utils";
import { cn } from "@/lib/utils";
import { useSelectedLayoutSegment } from "next/navigation";

const segmentLabelMap = {
  profile: "myProfile",
  "my-ads": "myAds",
  transactions: "myTransaction",
  favorites: "myFavorites",
  notifications: "notifications",
  reviews: "reviews",
  chat: "chat",
  "job-applications": "jobApplications",
  "user-subscription": "subscription",
  "refer-and-earn": "referAndEarn",
};

const ProfileLayout = ({ children }) => {
  const segment = useSelectedLayoutSegment();
  const isChat = segment === "chat";
  const heading = t(segmentLabelMap[segment] || "");

  return (
    <Layout>
      <BreadCrumb title2={heading} />
      <div className="container mt-8">
        <div className="flex items-center justify-between">
          <h1 className={cn("sectionTitle", segment === "user-subscription" && "hidden lg:block")}>{heading}</h1>
          {isChat && (
            <div className="xl:hidden">
              <BlockedUsersMenu />
            </div>
          )}
        </div>

        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-4 lg:border rounded-lg mt-6",
            isChat && "border"
          )}
        >
          <div className="hidden lg:block max-h-fit lg:col-span-1 lg:ltr:border-r lg:rtl:border-l">
            <ProfileSidebar />
          </div>

          <div className={cn("lg:col-span-3 lg:border-t-0", !isChat && "lg:p-7")}>
            {children}
          </div>
        </div>
      </div>
    </Layout >
  );
};

export default Checkauth(ProfileLayout);
