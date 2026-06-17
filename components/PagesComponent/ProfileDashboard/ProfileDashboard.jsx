"use client";
import ProfileSidebar from "@/components/Profile/ProfileSidebar";
import { usePathname } from "next/navigation";
import Checkauth from "@/HOC/Checkauth";
import Notifications from "../Notifications/Notifications";
import Profile from "@/components/Profile/Profile";
import MyAds from "../MyAds/MyAds";
import Favorites from "../Favorites/Favorites";
import Transactions from "../Transactions/Transactions";
import Reviews from "../Reviews/Reviews";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import Chat from "../Chat/Chat";
import Layout from "@/components/Layout/Layout";
import ProfileSubscription from "../Subscription/ProfileSubscription";
import JobApplications from "../JobApplications/JobApplications";
import { t } from "@/utils";
import BlockedUsersMenu from "../Chat/BlockedUsersMenu";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { getReduxCurrentLangCode } from "@/redux/reducer/languageSlice";
import { getReferralSettings } from "@/redux/reducer/settingSlice";
import ReferAndEarn from "../ReferAndEarn/ReferAndEarn";

const ProfileDashboard = () => {
  const currentLangCode = useSelector(getReduxCurrentLangCode); // to refresh the static lable with updated data
  const { refer_earn_enabled } = useSelector(getReferralSettings);
  const pathname = usePathname();
  const isNotifications = pathname === `/${currentLangCode}/notifications`;
  const isSubscriptions = pathname === `/${currentLangCode}/user-subscription`;
  const isProfile = pathname === `/${currentLangCode}/profile`;
  const isAds = pathname === `/${currentLangCode}/my-ads`;
  const isFavorite = pathname === `/${currentLangCode}/favorites`;
  const isTransaction = pathname === `/${currentLangCode}/transactions`;
  const isReviews = pathname === `/${currentLangCode}/reviews`;
  const isChat = pathname == `/${currentLangCode}/chat`;
  const isJobApplications = pathname == `/${currentLangCode}/job-applications`;
  const isReferAndEarn = refer_earn_enabled && pathname == `/${currentLangCode}/refer-and-earn`;

  const renderHeading = () => {
    if (isProfile) {
      return t("myProfile");
    } else if (isNotifications) {
      return t("notifications");
    } else if (isSubscriptions) {
      return t("subscription");
    } else if (isReferAndEarn) {
      return t("referAndEarn");
    } else if (isAds) {
      return t("myAds");
    } else if (isFavorite) {
      return t("myFavorites");
    } else if (isTransaction) {
      return t("myTransaction");
    } else if (isReviews) {
      return t("reviews");
    } else if (isChat) {
      return t("chat");;
    } else if (isJobApplications) {
      return t("jobApplications");
    }
  };

  const renderContent = () => {
    if (isProfile) {
      return <Profile />;
    } else if (isNotifications) {
      return <Notifications />;
    } else if (isSubscriptions) {
      return <ProfileSubscription />;
    } else if (isReferAndEarn) {
      return <ReferAndEarn />;
    } else if (isAds) {
      return <MyAds />;
    } else if (isFavorite) {
      return <Favorites />;
    } else if (isTransaction) {
      return <Transactions />;
    } else if (isReviews) {
      return <Reviews />;
    } else if (isChat) {
      return <Chat />;
    } else if (isJobApplications) {
      return <JobApplications />;
    }
  };
  const breadCrumbTitle = renderHeading();
  return (
    <Layout>
      <BreadCrumb title2={breadCrumbTitle} />
      <div className="container mt-8">
        <div className="flex items-center justify-between">
          <h1 className="sectionTitle">{renderHeading()}</h1>
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

          <div
            className={cn("lg:col-span-3 lg:border-t-0", !isChat && "lg:p-7")}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkauth(ProfileDashboard);
