"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { settingsData } from "@/redux/reducer/settingSlice";
import {
  getIsSafeDealTipsModalOpen,
  setIsSafeDealTipsModalOpen,
} from "@/redux/reducer/globalStateSlice";
import { t } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  FlagIcon,
  HandCoinsIcon,
  HandshakeIcon,
  IdentificationCardIcon,
  QrCodeIcon,
  WarningIcon,
} from "@phosphor-icons/react";

const SafeDealTipsModal = () => {
  const dispatch = useDispatch();
  const open = useSelector(getIsSafeDealTipsModalOpen);
  const settings = useSelector(settingsData);

  const handleClose = () => {
    dispatch(setIsSafeDealTipsModalOpen(false));
  };

  const tips = [
    { icon: QrCodeIcon, text: t("safeDealTipUpi") },
    { icon: HandCoinsIcon, text: t("safeDealTipAdvance") },
    {
      icon: FlagIcon,
      text: `${t("safeDealTipReportPrefix")} ${settings?.company_name || ""}.`,
    },
    { icon: IdentificationCardIcon, text: t("safeDealTipPersonalDetails") },
    { icon: HandshakeIcon, text: t("safeDealTipMeeting") },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:py-10 sm:px-10"
      >
        <DialogHeader className="items-center text-center">
          <div className="p-3 bg-destructive/10 text-destructive rounded-full">
            <WarningIcon size={28} weight="fill" />
          </div>
          <DialogTitle className="text-2xl font-semibold mt-2">
            {t("tipsForASafeDeal")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {tips.map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 text-muted-foreground shrink-0">
                <Icon size={22} />
              </div>
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>

        <Button onClick={handleClose} className="mt-2">
          {t("continue")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SafeDealTipsModal;
