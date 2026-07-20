import { getAdsenseSettings } from "@/redux/reducer/settingSlice";
import { useSelector } from "react-redux";

export function useAdsense() {
    return useSelector(getAdsenseSettings);
}