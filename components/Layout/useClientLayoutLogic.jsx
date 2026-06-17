import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settingsApi } from "@/utils/api";
import {
  settingsSucess,
  getIsMaintenanceMode,
} from "@/redux/reducer/settingSlice";
import {
  getKilometerRange,
  setKilometerRange,
  setIsBrowserSupported,
} from "@/redux/reducer/locationSlice";
import { getIsVisitedLandingPage } from "@/redux/reducer/globalStateSlice";
import { getIsRtl } from "@/redux/reducer/languageSlice";
import {
  getHasFetchedSystemSettings,
  setHasFetchedSystemSettings,
} from "@/utils/getFetcherStatus";
import { useNavigate } from "../Hooks/useNavigate";
import { useLanguageSync } from "../Hooks/useLanguageSync";
import { useParams, usePathname } from "next/navigation";

export function useClientLayoutLogic() {
  const dispatch = useDispatch();
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(!getHasFetchedSystemSettings());
  const { lang } = useParams();
  const isMaintenanceMode = useSelector(getIsMaintenanceMode);
  const isRtl = useSelector(getIsRtl);
  const appliedRange = useSelector(getKilometerRange);
  const isVisitedLandingPage = useSelector(getIsVisitedLandingPage);
  const [isRedirectToLanding, setIsRedirectToLanding] = useState(false);

  // Custom hook to handle language synchronization and translation fetching
  useLanguageSync(lang);

  useEffect(() => {
    const getSystemSettings = async () => {
      if (getHasFetchedSystemSettings()) {
        return;
      }
      try {
        // Get settings from API
        const response = await settingsApi.getSettings();
        const data = response?.data;
        dispatch(settingsSucess({ data }));

        // Set kilometer range from settings API
        const min = Number(data?.data?.min_length);
        const max = Number(data?.data?.max_length);
        if (appliedRange < min) dispatch(setKilometerRange(min));
        else if (appliedRange > max) dispatch(setKilometerRange(max));

        // Set primary color from settings API
        document.documentElement.style.setProperty(
          "--primary",
          data?.data?.web_theme_color
        );

        // Set favicon from settings API
        if (data?.data?.favicon_icon) {
          const favicon =
            document.querySelector('link[rel="icon"]') ||
            document.createElement("link");
          favicon.rel = "icon";
          favicon.href = data.data.favicon_icon;
          if (!document.querySelector('link[rel="icon"]')) {
            document.head.appendChild(favicon);
          }
        }

        setHasFetchedSystemSettings(true);
        // Check if landing page is enabled and redirect to landing page if not visited
        const showLandingPage = Number(data?.data?.show_landing_page) === 1;
        if (showLandingPage && !isVisitedLandingPage && !pathname.endsWith("/landing")) {
          setIsRedirectToLanding(true);
          navigate("/landing");
          return;
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSystemSettings();

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) dispatch(setIsBrowserSupported(false));
  }, [lang]);

  // Set direction of the document
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);

  return {
    isLoading,
    isMaintenanceMode,
    isRedirectToLanding,
  };
}
