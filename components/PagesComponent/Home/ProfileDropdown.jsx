import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userSignUpData } from "@/redux/reducer/authSlice";
import { t, truncate } from "@/utils";
import { useSelector } from "react-redux";
import { useMediaQuery } from "usehooks-ts";
import CustomImage from "@/components/Common/CustomImage";
import { useNavigate } from "@/components/Hooks/useNavigate";
import { UserIcon, BellIcon, ChatsIcon, CurrencyCircleDollarIcon, ShoppingBagOpenIcon, HeartIcon, ReceiptIcon, StarIcon, BriefcaseIcon, SignOutIcon, CaretDownIcon, HandCoinsIcon } from "@phosphor-icons/react";
import { getReferralSettings } from "@/redux/reducer/settingSlice";

const ProfileDropdown = ({ IsLogout, setIsLogout }) => {
  const isSmallScreen = useMediaQuery("(max-width: 1200px)");
  const { navigate } = useNavigate();
  const UserData = useSelector(userSignUpData);
  const { refer_earn_enabled } = useSelector(getReferralSettings);
  return (
    <DropdownMenu key={IsLogout}>
      <DropdownMenuTrigger className="flex items-center gap-1">
        <CustomImage
          src={UserData?.profile}
          alt={UserData?.name}
          width={32}
          height={32}
          className="rounded-full w-8 h-8 aspect-square object-cover border"
        />
        <p>{truncate(UserData.name, 12)}</p>
        <CaretDownIcon className="text-muted-foreground shrink-0" size={12} weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isSmallScreen ? "start" : "center"}>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <UserIcon size={16} weight="bold" />
          <span>{t("myProfile")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/notifications")}
        >
          <BellIcon size={16} weight="bold" />
          {t("notification")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/chat")}
        >
          <ChatsIcon size={16} weight="bold" />
          {t("chat")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/user-subscription")}
        >
          <CurrencyCircleDollarIcon size={16} weight="bold" />
          {t("subscription")}
        </DropdownMenuItem>
        {refer_earn_enabled && <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/refer-and-earn")}
        >
          <HandCoinsIcon size={16} weight="bold" />
          {t("referAndEarn")}
        </DropdownMenuItem>}

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/my-ads")}
        >
          <ShoppingBagOpenIcon size={16} weight="bold" />
          {t("myAds")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/favorites")}
        >
          <HeartIcon size={16} weight="bold" />
          {t("favorites")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/transactions")}>
          <ReceiptIcon size={16} weight="bold" />
          {t("transaction")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/reviews")}
        >
          <StarIcon size={16} weight="bold" />
          {t("myReviews")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/job-applications")}
        >
          <BriefcaseIcon size={16} weight="bold" />
          {t("jobApplications")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setIsLogout(true)}
        >
          <SignOutIcon size={16} weight="bold" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
