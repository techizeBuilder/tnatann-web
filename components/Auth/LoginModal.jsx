"use client";
import { handleFirebaseAuthError, t } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Fcmtoken,
  settingsData,
} from "@/redux/reducer/settingSlice";
import "react-phone-input-2/lib/style.css";
import { Button } from "../ui/button";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "sonner";
import { getUserExistsApi, userSignUpApi } from "@/utils/api";
import { loadUpdateData } from "@/redux/reducer/authSlice";
import FirebaseData from "@/utils/Firebase.js";
import LoginWithEmailForm from "./LoginWithEmailForm";
import LoginWithMobileForm from "./LoginWithMobileForm";
import TermsAndPrivacyLinks from "./TermsAndPrivacyLinks";
import GoogleConsentModal from "./GoogleConsentModal";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import { CircleNotchIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import googleLogo from '../../public/assets/google_logo.svg'
import CustomImage from "../Common/CustomImage";

const LoginModal = ({ IsLoginOpen, setIsRegisterModalOpen, googleConsent, setGoogleConsent }) => {
  const settings = useSelector(settingsData);
  const auth = getAuth();
  const { signOut } = FirebaseData();
  const fetchFCM = useSelector(Fcmtoken);
  const [isLoadingWithGoogle, setIsLoadingWithGoogle] = useState(false)
  const [showLoader, setShowLoader] = useState(false)

  const [descriptionState, setDescriptionState] = useState({
    type: "login", // "login" | "otp"
    phoneNumber: "",
  });
  const [isOTPScreen, setIsOTPScreen] = useState(false);

  // Active authentication methods
  const mobile_authentication = Number(settings?.mobile_authentication);
  const google_authentication = Number(settings?.google_authentication);
  const email_authentication = Number(settings?.email_authentication);

  const [IsLoginWithEmail, setIsLoginWithEmail] = useState(
    mobile_authentication === 0 && email_authentication === 1 ? true : false
  );

  const IsShowOrSignIn =
    !isOTPScreen &&
    !(
      mobile_authentication === 0 &&
      email_authentication === 0 &&
      google_authentication === 1
    ) && google_authentication === 1;

  const OnHide = async () => {
    setIsLoginOpen(false);
    setIsOTPScreen(false);
    setDescriptionState({ type: "login", phoneNumber: "" });
  };

  const handleChangeClick = () => {
    setIsOTPScreen(false);
    setDescriptionState({ type: "login", phoneNumber: "" });
  };

  const completeGoogleSignup = async (user) => {
    try {
      const response = await userSignUpApi.userSignup({
        name: user.displayName ? user.displayName : "",
        email: user?.email,
        firebase_id: user?.uid, // Accessing UID directly from the user object
        fcm_id: fetchFCM ? fetchFCM : "",
        type: "google",
      });

      const data = response.data;
      if (data.error === true) {
        toast.error(data.message);
      } else {
        loadUpdateData(data);
        toast.success(data.message);
      }
      OnHide();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to complete signup");
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsLoadingWithGoogle(true)
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const existsRes = await getUserExistsApi.getUserExists({ firebase_id: user?.uid });
      if (existsRes?.data?.error === false) {
        // Existing user - proceed with normal login
        await completeGoogleSignup(user);
      } else {
        // First-time user - hold login and collect consent
        setGoogleConsent({ isOpen: true, checked: false, loading: false, pendingUser: user });
        setIsLoginOpen(false); // Close the login modal while waiting for consent
      }
    } catch (error) {
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode);
    } finally {
      setIsLoadingWithGoogle(false)
    }
  };

  const handleGoogleConsentCancel = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setGoogleConsent({ isOpen: false, checked: false, loading: false, pendingUser: null });
    }
  };

  const handleGoogleConsentContinue = async () => {
    setGoogleConsent((prev) => ({ ...prev, loading: true }));
    await completeGoogleSignup(googleConsent.pendingUser);
    setGoogleConsent({ isOpen: false, checked: false, loading: false, pendingUser: null });
  };

  const handleCreateAnAccount = () => {
    OnHide();
    setIsRegisterModalOpen(true);
  };

  return (
    <>
      <Dialog open={IsLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="px-10 sm:py-12.5 sm:px-22.5"
        >
          <DialogHeader>
            <DialogTitle className="text-3xl sm:text-4xl font-light">
              {descriptionState.type === "otp" ? (
                t("verifyOtp")
              ) : (
                <>
                  {t("loginTo")}{" "}
                  <span className="text-primary">{settings?.company_name}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base text-black font-light">
              {descriptionState.type === "otp" ? (
                <>
                  {t("sentTo")} {descriptionState.phoneNumber}{" "}
                  <span
                    onClick={handleChangeClick}
                    className="text-primary underline cursor-pointer"
                  >
                    {t("change")}
                  </span>
                </>
              ) : (
                <>
                  {t("newto")} {settings?.company_name}?{" "}
                  <span
                    className="text-primary cursor-pointer underline"
                    onClick={handleCreateAnAccount}
                  >
                    {t("createAccount")}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-7.5 mt-3.5">
            {!(
              mobile_authentication === 0 &&
              email_authentication === 0 &&
              google_authentication === 1
            ) &&
              mobile_authentication === 1 &&
              email_authentication === 1 &&
              (IsLoginWithEmail ? (
                <LoginWithEmailForm OnHide={OnHide} key={IsLoginWithEmail} showLoader={showLoader} setShowLoader={setShowLoader} isLoadingWithGoogle={isLoadingWithGoogle} />
              ) : (
                <LoginWithMobileForm
                  OnHide={OnHide}
                  setDescriptionState={setDescriptionState}
                  isOTPScreen={isOTPScreen}
                  setIsOTPScreen={setIsOTPScreen}
                  key={IsLoginWithEmail}
                  showLoader={showLoader}
                  setShowLoader={setShowLoader}
                />
              ))}

            {email_authentication === 1 && mobile_authentication === 0 && (
              <LoginWithEmailForm OnHide={OnHide} key={IsLoginWithEmail} showLoader={showLoader} setShowLoader={setShowLoader} isLoadingWithGoogle={isLoadingWithGoogle} />
            )}

            {mobile_authentication === 1 && email_authentication === 0 && (
              <LoginWithMobileForm
                OnHide={OnHide}
                setDescriptionState={setDescriptionState}
                isOTPScreen={isOTPScreen}
                setIsOTPScreen={setIsOTPScreen}
                key={IsLoginWithEmail}
                showLoader={showLoader}
                setShowLoader={setShowLoader}
              />
            )}

            {IsShowOrSignIn && (
              <div className="flex items-center gap-2">
                <hr className="w-full" />
                <p className="text-nowrap text-sm">{t("orSignInWith")}</p>
                <hr className="w-full" />
              </div>
            )}

            {!isOTPScreen && (
              <div className="flex flex-col gap-4">
                {google_authentication === 1 && (
                  <Button
                    variant="outline"
                    size="big"
                    className="flex items-center justify-center py-4 text-base"
                    onClick={handleGoogleSignup}
                    disabled={isLoadingWithGoogle || showLoader}
                  >

                    {
                      isLoadingWithGoogle ? <CircleNotchIcon className="size-6! animate-spin" weight="bold" /> : <CustomImage src={googleLogo} alt="Google" className='size-6 aspect-square' width={24} height={24} />
                    }
                    <span>{t("continueWithGoogle")}</span>
                  </Button>
                )}

                {IsLoginWithEmail && mobile_authentication === 1 ? (
                  <Button
                    variant="outline"
                    size="big"
                    className="flex items-center justify-center py-4 text-base h-auto"
                    onClick={() => setIsLoginWithEmail(false)}
                    disabled={showLoader || isLoadingWithGoogle}
                  >
                    <PhoneIcon className="size-6!" />
                    {t("continueWithMobile")}
                  </Button>
                ) : (
                  !IsLoginWithEmail &&
                  email_authentication === 1 && (
                    <Button
                      variant="outline"
                      size="big"
                      className="flex items-center justify-center py-4 text-base h-auto"
                      onClick={() => setIsLoginWithEmail(true)}
                      disabled={showLoader || isLoadingWithGoogle}
                    >
                      <EnvelopeSimpleIcon className="size-6!" />
                      {t("continueWithEmail")}
                    </Button>
                  )
                )}
              </div>
            )}
            {!isOTPScreen && <TermsAndPrivacyLinks OnHide={OnHide} />}
          </div>
          <div id="recaptcha-container" style={{ display: "none" }}></div>
        </DialogContent>
      </Dialog>

      <GoogleConsentModal
        open={googleConsent.isOpen}
        checked={googleConsent.checked}
        onCheckedChange={(checked) =>
          setGoogleConsent((prev) => ({ ...prev, checked }))
        }
        loading={googleConsent.loading}
        onCancel={handleGoogleConsentCancel}
        onContinue={handleGoogleConsentContinue}
        OnHide={OnHide}
      />
    </>
  );
};

export default LoginModal;
