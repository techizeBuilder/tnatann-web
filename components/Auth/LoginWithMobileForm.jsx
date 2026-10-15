import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import useAutoFocus from "../Hooks/useAutoFocus";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { toast } from "sonner";
import { handleFirebaseAuthError, t } from "@/utils";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getOtpApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { getOtpServiceProvider } from "@/redux/reducer/settingSlice";
import { cn } from "@/lib/utils";
import { CircleNotchIcon } from "@phosphor-icons/react";
import OtpScreen from "./OtpScreen";

const LoginWithMobileForm = ({
  OnHide,
  setDescriptionState,
  isOTPScreen,
  setIsOTPScreen,
  showLoader,
  setShowLoader,
}) => {
  const auth = getAuth();
  const otp_service_provider = useSelector(getOtpServiceProvider);
  const phoneInputRef = useAutoFocus();

  const [number, setNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState({ phone: "" });

  const countryCodeDigitsOnly = countryCode.replace(/\D/g, "");
  const startsWithCountryCode = number.startsWith(countryCodeDigitsOnly);
  const formattedNumber = startsWithCountryCode
    ? number.substring(countryCodeDigitsOnly.length)
    : number;

  const generateRecaptcha = async () => {
    if (window.recaptchaVerifier && !window.recaptchaVerifier.destroyed) {
      return window.recaptchaVerifier;
    }
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (!recaptchaContainer) {
      console.error("Container element 'recaptcha-container' not found.");
      return null;
    }
    recaptchaContainer.innerHTML = "";
    window.recaptchaVerifier = undefined;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainer,
        { size: "invisible" }
      );
      return window.recaptchaVerifier;
    } catch (error) {
      console.error("Error initializing RecaptchaVerifier:", error.message);
      return null;
    }
  };

  useEffect(() => {
    return () => {
      recaptchaClear();
    };
  }, []);

  const recaptchaClear = async () => {
    if (window.recaptchaVerifier && !window.recaptchaVerifier.destroyed) {
      try {
        await window.recaptchaVerifier.clear();
      } catch (error) {
        // Ignore errors - verifier might already be cleared
      }
    }
    window.recaptchaVerifier = undefined;
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = "";
    }
  };

  const sendOtpWithTwillio = async (PhoneNumber) => {
    try {
      const response = await getOtpApi.getOtp({
        number: formattedNumber,
        country_code: countryCode,
      });
      if (response?.data?.error === false) {
        toast.success(t("otpSentSuccess"));
        setIsOTPScreen(true);
        setResendTimer(60);
        setDescriptionState({ type: "otp", phoneNumber: PhoneNumber });
      } else {
        toast.error(t("failedToSendOtp"));
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setShowLoader(false);
    }
  };

  const sendOtpWithFirebase = async (PhoneNumber) => {
    try {
      const appVerifier = await generateRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        PhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      toast.success(t("otpSentSuccess"));
      setIsOTPScreen(true);
      setResendTimer(60);
      setDescriptionState({ type: "otp", phoneNumber: PhoneNumber });
    } catch (error) {
      console.log(error);
      handleFirebaseAuthError(error.code);
    } finally {
      setShowLoader(false);
    }
  };

  const handleInputChange = (value, data) => {
    setNumber(value);
    setCountryCode("+" + (data?.dialCode || ""));
    setRegionCode(data?.countryCode.toLowerCase() || "");
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleCountryChange = (code) => {
    setCountryCode(code);
  };

  const validateForm = () => {
    if (!formattedNumber) {
      setErrors({ phone: t("pleaseEnterMobileNumber") });
      return false;
    }
    if (!isValidPhoneNumber(`${countryCode}${formattedNumber}`)) {
      setErrors({ phone: t("invalidPhoneNumber") });
      return false;
    }
    setErrors({ phone: "" });
    return true;
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const PhoneNumber = `${countryCode}${formattedNumber}`;
    setShowLoader(true);
    if (otp_service_provider === "twilio" || otp_service_provider === "2factor") {
      await sendOtpWithTwillio(PhoneNumber);
    } else {
      await sendOtpWithFirebase(PhoneNumber);
    }
  };

  if (isOTPScreen) {
    return (
      <OtpScreen
        OnHide={OnHide}
        generateRecaptcha={generateRecaptcha}
        countryCode={countryCode}
        formattedNumber={formattedNumber}
        confirmationResult={confirmationResult}
        setConfirmationResult={setConfirmationResult}
        setResendTimer={setResendTimer}
        resendTimer={resendTimer}
        regionCode={regionCode}
        key="login-otp"
      />
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleMobileSubmit}>
      <div className="labelInputCont">
        <Label className="font-semibold requiredInputLabel">
          {t("mobileNumber")}
        </Label>
        <PhoneInput
          country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
          value={number}
          onChange={(phone, data) => handleInputChange(phone, data)}
          onCountryChange={handleCountryChange}
          inputProps={{
            name: "phone",
            ref: phoneInputRef,
          }}
          enableLongNumbers
          containerClass={cn("border border-border rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary", errors.phone && "border-destructive focus-within:ring-destructive")}
          inputClass="!border-0 !h-10 !w-full !bg-transparent !outline-none !shadow-none"
          buttonClass={cn("!border-0 !border-r !bg-transparent", errors.phone && "!border-r-destructive")}
        />
        {errors.phone && (
          <span className="text-destructive text-sm">{errors.phone}</span>
        )}
      </div>
      <Button
        type="submit"
        disabled={showLoader}
        className="text-xl text-white font-light px-4 py-2"
        size="big"
      >
        {showLoader ? <CircleNotchIcon className="size-6! animate-spin" weight="bold" /> : t("continue")}
      </Button>
    </form>
  );
};

export default LoginWithMobileForm;
