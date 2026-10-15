"use client";
import {
  getIsFreAdListing,
  getOtpServiceProvider,
  getHomeScreenSections,
  settingsData,
} from "@/redux/reducer/settingSlice";
import { t, truncate } from "@/utils";
import CustomLink from "@/components/Common/CustomLink";
import { useSelector } from "react-redux";
import HomeMobileMenu from "./HomeMobileMenu.jsx";
import MailSentSuccessModal from "@/components/Auth/MailSentSuccessModal.jsx";
import { useEffect, useState } from "react";
import {
  getIsLoggedIn,
  logoutSuccess,
  userSignUpData,
} from "@/redux/reducer/authSlice.js";
import ProfileDropdown from "./ProfileDropdown.jsx";
import { toast } from "sonner";
import FirebaseData from "@/utils/Firebase.js";
import dynamic from "next/dynamic";
import {
  getIsLoginModalOpen,
  setIsLoginOpen,
} from "@/redux/reducer/globalStateSlice.js";
import ReusableAlertDialog from "@/components/Common/ReusableAlertDialog";
import { deleteUserApi, logoutApi } from "@/utils/api.js";
import { useMediaQuery } from "usehooks-ts";
import UnauthorizedModal from "@/components/Auth/UnauthorizedModal.jsx";
import SafeDealTipsModal from "@/components/Auth/SafeDealTipsModal.jsx";
import CustomImage from "@/components/Common/CustomImage.jsx";
import { BellIcon, CaretRightIcon, ChatsIcon, CircleNotchIcon, HeartIcon, MapPinIcon, PlusIcon, UserIcon } from "@phosphor-icons/react";
import { useNavigate } from "@/components/Hooks/useNavigate.jsx";
import { useParams, usePathname } from "next/navigation.js";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import HeaderCategories from "./HeaderCategories.jsx";
import { deleteUser, getAuth } from "firebase/auth";
import DeleteAccountVerifyOtpModal from "@/components/Auth/DeleteAccountVerifyOtpModal.jsx";
import useGetCategories from "@/components/Layout/useGetCategories.jsx";
import PackageRequiredModal from "./PackageRequiredModal.jsx";
import SelectAdTypeModal from "./SelectAdTypeModal.jsx";
import { getCityData } from "@/redux/reducer/locationSlice.js";
import Search from "./Search.jsx";

const LoginModal = dynamic(() => import("@/components/Auth/LoginModal.jsx"), {
  ssr: false,
});
const RegisterModal = dynamic(
  () => import("@/components/Auth/RegisterModal.jsx"),
  {
    ssr: false,
  }
);
const LocationModal = dynamic(
  () => import("@/components/Location/LocationModal.jsx"),
  {
    ssr: false,
  }
);

const HeaderCategoriesSkeleton = () => {
  return (
    <div className="hidden lg:block container">
      <div className="py-1.5 border-b">
        <Skeleton className="w-full h-10" />
      </div>
    </div>
  );
};

const HomeHeader = () => {
  // 📦 Framework & Firebase
  const { navigate } = useNavigate();
  const { signOut } = FirebaseData();
  const pathname = usePathname();

  // 🔌 Redux State (via useSelector)

  // User & Auth
  const userData = useSelector(userSignUpData);
  const IsLoggedin = useSelector(getIsLoggedIn);
  const IsLoginOpen = useSelector(getIsLoginModalOpen);
  const otp_service_provider = useSelector(getOtpServiceProvider);
  const [googleConsent, setGoogleConsent] = useState({
    isOpen: false,
    checked: false,
    loading: false,
    pendingUser: null,
  });


  // Ads & Categories
  // const isCategoryLoading = useSelector(getIsCatLoading);
  // const cateData = useSelector(CategoryData);
  const { getCategories, cateData, isCatLoading: isCategoryLoading } = useGetCategories();
  const IsFreeAdListing = useSelector(getIsFreAdListing);

  // Location
  const cityData = useSelector(getCityData);

  // Language & Settings
  const { lang: langCode } = useParams();
  const settings = useSelector(settingsData);
  const homeScreenSections = useSelector(getHomeScreenSections);
  const showCategories = !homeScreenSections || homeScreenSections.some((s) => s.section_type === "all_categories");

  // 🎛️ Local UI State (via useState)

  // Modals
  const [IsRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [IsLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [IsVerifyOtpBeforeDelete, setIsVerifyOtpBeforeDelete] = useState(false);

  // Auth State
  const [IsLogout, setIsLogout] = useState(false);
  const [IsLoggingOut, setIsLoggingOut] = useState(false);

  // Profile
  const [IsUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Ad Listing
  const [IsAdListingClicked, setIsAdListingClicked] = useState(false);
  const [IsPackageRequired, setIsPackageRequired] = useState(false);
  const [isSelectAdTypeOpen, setIsSelectAdTypeOpen] = useState(false);

  // Email Status
  const [IsMailSentSuccess, setIsMailSentSuccess] = useState(false);

  // 📱 Media Query
  const isLargeScreen = useMediaQuery("(min-width: 992px)");

  //delete account state
  const [manageDeleteAccount, setManageDeleteAccount] = useState({
    IsDeleteAccount: false,
    IsDeleting: false,
  });


  useEffect(() => {
    const isAdsPage = pathname.includes("/ads");
    if (!showCategories && !isAdsPage) return;
    getCategories(1);
  }, [langCode, pathname]);


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      const res = await logoutApi.logoutApi({
        ...(userData?.fcm_id && { fcm_token: userData?.fcm_id }),
      });
      if (res?.data?.error === false) {
        logoutSuccess();
        toast.success(t("signOutSuccess"));
        setIsLogout(false);
        // avoid redirect if already on home page otherwise router.push triggering server side api calls
        if (pathname !== "/") {
          navigate("/");
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log("Failed to log out", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdListing = async () => {
    if (!IsLoggedin) {
      setIsLoginOpen(true);
      return;
    }
    if (!userData?.name || !userData?.email) {
      setIsUpdatingProfile(true);
      return;
    }
    setIsSelectAdTypeOpen(true);
  };

  const handleUpdateProfile = () => {
    setIsUpdatingProfile(false);
    navigate("/profile");
  };

  const locationText =
    cityData?.address_translated || cityData?.formattedAddress;

  const handleDeleteAcc = async () => {
    try {
      setManageDeleteAccount((prev) => ({ ...prev, IsDeleting: true }));
      const auth = getAuth();
      const user = auth.currentUser;
      const isMobileLogin = userData?.type == "phone";
      const needsOtpVerification = isMobileLogin && !user && otp_service_provider === "firebase";
      if (user) {
        await deleteUser(user);
      } else if (needsOtpVerification) {
        setManageDeleteAccount((prev) => ({ ...prev, IsDeleteAccount: false }));
        setIsVerifyOtpBeforeDelete(true);
        return;
      }
      await deleteUserApi.deleteUser();
      logoutSuccess();
      toast.success(t("userDeleteSuccess"));
      setManageDeleteAccount((prev) => ({ ...prev, IsDeleteAccount: false }));
      // avoid redirect if already on home page otherwise router.push triggering server side api calls
      if (pathname !== "/") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting user:", error.message);
      const isMobileLogin = userData?.type === "phone";
      if (error.code === "auth/requires-recent-login" || error.message?.includes("CREDENTIAL_TOO_OLD_LOGIN_AGAIN")) {
        if (isMobileLogin) {
          setManageDeleteAccount((prev) => ({
            ...prev,
            IsDeleteAccount: false, // close delete modal
          }));
          setIsVerifyOtpBeforeDelete(true); // open OTP screen
          return;
        }
        logoutSuccess();
        toast.error(t("deletePop"));
        setManageDeleteAccount((prev) => ({ ...prev, IsDeleteAccount: false }));
      }
    } finally {
      setManageDeleteAccount((prev) => ({ ...prev, IsDeleting: false }));
    }
  };

  return (
    <>
      <header className="py-5 border-b">
        <nav className="w-full px-4 lg:px-8">
          <div className="space-between gap-3 lg:gap-5">
            <CustomLink href="/" className="shrink-0">
              <CustomImage
                src={settings?.header_logo}
                alt="logo"
                width={195}
                height={52}
                loading="eager"
                className="w-full h-9.75 sm:h-13 object-contain ltr:object-left rtl:object-right max-w-48.75"
              />
            </CustomLink>

            {/* desktop location + search */}

            {isLargeScreen && (
              <div className="flex flex-1 items-center border leading-none rounded-full">
                <button
                  className="flex items-center gap-2 shrink-0 py-1.5 ltr:pl-3 ltr:pr-2 rtl:pr-3 rtl:pl-2"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <MapPinIcon
                    size={16}
                    className="shrink-0"
                    title={locationText ? locationText : t("addLocation")} />
                  <p
                    className="hidden xl:block text-sm"
                    title={locationText ? locationText : t("addLocation")}
                  >
                    {locationText
                      ? truncate(locationText, 12)
                      : truncate(t("addLocation"), 12)}
                  </p>
                  <CaretRightIcon size={14} className="shrink-0 text-muted-foreground rtl:rotate-180" />
                </button>
                <div className="h-6 w-px bg-border shrink-0" />
                <Search />
              </div>
            )}

            <div className="hidden lg:flex items-center gap-5 xl:gap-6 shrink-0">
              {IsLoggedin ? (
                <>
                  <button
                    className="flex flex-col items-center gap-0.5 text-xs"
                    onClick={() => navigate("/favorites")}
                    title={t("favorites")}
                  >
                    <HeartIcon size={18} weight="bold" />
                    {truncate(t("favorites"), 12)}
                  </button>
                  <button
                    className="flex flex-col items-center gap-0.5 text-xs"
                    onClick={() => navigate("/chat")}
                    title={t("chat")}
                  >
                    <ChatsIcon size={18} weight="bold" />
                    {truncate(t("chat"), 12)}
                  </button>
                  <ProfileDropdown
                    setIsLogout={setIsLogout}
                    IsLogout={IsLogout}
                  />
                </>
              ) : (
                <>
                  <button
                    className="flex flex-col items-center gap-0.5 text-xs"
                    onClick={() => setIsLoginOpen(true)}
                    title={t("favorites")}
                  >
                    <HeartIcon size={18} weight="bold" />
                    {truncate(t("favorites"), 12)}
                  </button>
                  <button
                    className="flex flex-col items-center gap-0.5 text-xs"
                    onClick={() => setIsLoginOpen(true)}
                    title={t("login")}
                  >
                    <UserIcon size={18} weight="bold" />
                    {truncate(t("login"), 12)}
                  </button>
                </>
              )}

              <button
                className="rounded-full p-px bg-[linear-gradient(to_right,#38bdf8,#22c55e,#facc15,#ec4899)] rtl:bg-[linear-gradient(to_left,#38bdf8,#22c55e,#facc15,#ec4899)]"
                disabled={IsAdListingClicked}
                onClick={handleAdListing}
                title={t("sell")}
              >
                <span className="flex items-center gap-1 bg-background rounded-full px-3 py-2 font-semibold">
                  {IsAdListingClicked ? (
                    <CircleNotchIcon size={18} className="animate-spin" weight="bold" />
                  ) : (
                    <PlusIcon size={18} weight="bold" />
                  )}

                  <span className="uppercase">
                    {t("sell")}
                  </span>
                </span>
              </button>

              {IsLoggedin && (
                <button
                  onClick={() => navigate("/notifications")}
                  title={t("notification")}
                >
                  <BellIcon size={20} />
                </button>
              )}
            </div>
            <HomeMobileMenu
              setIsLocationModalOpen={setIsLocationModalOpen}
              setIsRegisterModalOpen={setIsRegisterModalOpen}
              setIsLogout={setIsLogout}
              locationText={locationText}
              handleAdListing={handleAdListing}
              IsAdListingClicked={IsAdListingClicked}
              setManageDeleteAccount={setManageDeleteAccount}
            />
          </div>

          {!isLargeScreen && (
            <div className="flex items-center border leading-none rounded-full mt-2">
              <Search />
            </div>
          )}
        </nav>
      </header>
      {showCategories && (
        isCategoryLoading && !cateData.length ? (
          <HeaderCategoriesSkeleton />
        ) : (
          cateData &&
          cateData.length > 0 && <HeaderCategories cateData={cateData} />
        )
      )}

      <LoginModal
        key={IsLoginOpen}
        IsLoginOpen={IsLoginOpen}
        setIsRegisterModalOpen={setIsRegisterModalOpen}
        googleConsent={googleConsent}
        setGoogleConsent={setGoogleConsent}
      />

      <RegisterModal
        setIsMailSentSuccess={setIsMailSentSuccess}
        IsRegisterModalOpen={IsRegisterModalOpen}
        setIsRegisterModalOpen={setIsRegisterModalOpen}
        key={`${IsRegisterModalOpen}-register-modal`}
      />
      <MailSentSuccessModal
        IsMailSentSuccess={IsMailSentSuccess}
        setIsMailSentSuccess={setIsMailSentSuccess}
      />

      {/* Reusable Alert Dialog for Logout */}
      <ReusableAlertDialog
        open={IsLogout}
        onCancel={() => setIsLogout(false)}
        onConfirm={handleLogout}
        title={t("confirmLogout")}
        description={t("areYouSureToLogout")}
        cancelText={t("cancel")}
        confirmText={t("yes")}
        confirmDisabled={IsLoggingOut}
      />

      {/* Reusable Alert Dialog for Updating Profile */}
      <ReusableAlertDialog
        open={IsUpdatingProfile}
        onCancel={() => setIsUpdatingProfile(false)}
        onConfirm={handleUpdateProfile}
        title={t("updateProfile")}
        description={t("youNeedToUpdateProfile")}
        confirmText={t("yes")}
      />

      {!isLargeScreen && (
        <ReusableAlertDialog
          open={manageDeleteAccount?.IsDeleteAccount}
          onCancel={() =>
            setManageDeleteAccount((prev) => ({
              ...prev,
              IsDeleteAccount: false,
            }))
          }
          onConfirm={handleDeleteAcc}
          title={t("areYouSure")}
          description={
            <ul className="list-disc list-inside mt-2">
              <li>{t("adsAndTransactionWillBeDeleted")}</li>
              <li>{t("accountsDetailsWillNotRecovered")}</li>
              <li>{t("subWillBeCancelled")}</li>
              <li>{t("savedMesgWillBeLost")}</li>
            </ul>
          }
          cancelText={t("cancel")}
          confirmText={t("yes")}
          confirmDisabled={manageDeleteAccount?.IsDeleting}
        />
      )}

      <LocationModal
        key={`${IsLocationModalOpen}-location-modal`}
        IsLocationModalOpen={IsLocationModalOpen}
        setIsLocationModalOpen={setIsLocationModalOpen}
      />
      <UnauthorizedModal />
      <SafeDealTipsModal />
      <PackageRequiredModal
        open={IsPackageRequired}
        onClose={() => setIsPackageRequired(false)}
      />
      <SelectAdTypeModal
        open={isSelectAdTypeOpen}
        onClose={() => setIsSelectAdTypeOpen(false)}
      />
      <DeleteAccountVerifyOtpModal
        isOpen={IsVerifyOtpBeforeDelete}
        setIsOpen={setIsVerifyOtpBeforeDelete}
        key={`${IsVerifyOtpBeforeDelete}-delete-account-verify-otp-modal`}
        pathname={pathname}
        navigate={navigate}
      />
    </>
  );
};

export default HomeHeader;
