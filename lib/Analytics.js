import { getAnalytics, isSupported } from "firebase/analytics";
import { app } from "@/utils/Firebase";

let analyticsInstance = null;

export async function initAnalytics() {
    try {
        const supported = await isSupported();
        if (!supported) return null;
        if (analyticsInstance) return analyticsInstance;
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
    } catch (err) {
        console.error("Analytics init failed:", err);
        return null;
    }
}