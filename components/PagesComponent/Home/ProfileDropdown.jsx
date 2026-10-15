import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userSignUpData } from "@/redux/reducer/authSlice";
import { t, truncate } from "@/utils";
import { useSelector } from "react-redux";
import { useMediaQuery } from "usehooks-ts";
import CustomImage from "@/components/Common/CustomImage";
import CustomLink from "@/components/Common/CustomLink";
import { useNavigate } from "@/components/Hooks/useNavigate";
import {
  BellIcon,
  ChatsIcon,
  CurrencyCircleDollarIcon,
  ShoppingBagOpenIcon,
  HeartIcon,
  ReceiptIcon,
  StarIcon,
  BriefcaseIcon,
  SignOutIcon,
  HandCoinsIcon,
  UserCircleIcon,
  CrownIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import { getReferralSettings } from "@/redux/reducer/settingSlice";

// Helper to get first letter of name for avatar fallback
const getInitial = (name) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

const ProfileDropdown = ({ IsLogout, setIsLogout }) => {
  const isSmallScreen = useMediaQuery("(max-width: 1200px)");
  const { navigate } = useNavigate();
  const UserData = useSelector(userSignUpData);
  const { refer_earn_enabled } = useSelector(getReferralSettings);

  const menuItems = [
    {
      icon: <ShoppingBagOpenIcon size={20} />,
      label: t("myAds"),
      path: "/my-ads",
    },
    {
      icon: <CurrencyCircleDollarIcon size={20} />,
      label: t("subscription"),
      path: "/user-subscription",
    },
    {
      icon: <CrownIcon size={20} />,
      label: t("becomeAnEliteSeller"),
      path: "/elite-seller",
      badge: t("new"),
      newTab: true,
    },
    {
      icon: <BellIcon size={20} />,
      label: t("notification"),
      path: "/notifications",
    },
    {
      icon: <ChatsIcon size={20} />,
      label: t("chat"),
      path: "/chat",
    },
    {
      icon: <HeartIcon size={20} />,
      label: t("favorites"),
      path: "/favorites",
    },
    {
      icon: <ReceiptIcon size={20} />,
      label: t("transaction"),
      path: "/transactions",
    },
    {
      icon: <StarIcon size={20} />,
      label: t("myReviews"),
      path: "/reviews",
    },
    {
      icon: <BriefcaseIcon size={20} />,
      label: t("jobApplications"),
      path: "/job-applications",
    },
    {
      icon: <QuestionIcon size={20} />,
      label: t("help"),
      path: "/help",
      newTab: true,
    },
    ...(refer_earn_enabled
      ? [
          {
            icon: <HandCoinsIcon size={20} />,
            label: t("referAndEarn"),
            path: "/refer-and-earn",
          },
        ]
      : []),
  ];

  return (
    <DropdownMenu key={IsLogout}>
      {/* Trigger — avatar circle with initial fallback */}
      <DropdownMenuTrigger className="flex items-center focus:outline-none">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary">
          {UserData?.profile ? (
            <CustomImage
              src={UserData.profile}
              alt={UserData?.name}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {getInitial(UserData?.name)}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown panel */}
      <DropdownMenuContent
        align={isSmallScreen ? "start" : "end"}
        sideOffset={8}
        className="w-72 p-0 shadow-xl border rounded-xl overflow-hidden"
      >
        {/* ── Header: avatar + name ── */}
        <div className="flex items-center gap-3 px-4 py-4 bg-muted/40">
          <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-primary">
            {UserData?.profile ? (
              <CustomImage
                src={UserData.profile}
                alt={UserData?.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {getInitial(UserData?.name)}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate leading-tight">
              {truncate(UserData?.name, 18)} ...
            </p>
          </div>
        </div>

        {/* ── View & Edit Profile button ── */}
        <div className="px-4 py-3 border-b">
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm py-2.5 rounded-md transition-colors"
          >
            {t("viewAndEditProfile")}
          </button>
        </div>

        {/* ── Menu items ── */}
        <div className="py-1">
          {menuItems.map((item, index) =>
            item.newTab ? (
              <CustomLink
                key={index}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ltr:ml-auto rtl:mr-auto bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </CustomLink>
            ) : (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ltr:ml-auto rtl:mr-auto bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          )}
        </div>

        <DropdownMenuSeparator />

        {/* ── Logout ── */}
        <div className="py-1">
          <button
            onClick={() => setIsLogout(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <SignOutIcon size={20} className="shrink-0" />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
