"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/utils";
import {
  WarningIcon,
  KeyboardIcon,
  HandCoinsIcon,
  FlagIcon,
  IdentificationCardIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

const tips = [
  { icon: KeyboardIcon, key: "safeDealTipPin" },
  { icon: HandCoinsIcon, key: "safeDealTipAdvance" },
  { icon: FlagIcon, key: "safeDealTipReport" },
  { icon: IdentificationCardIcon, key: "safeDealTipPersonalDetails" },
  { icon: UsersThreeIcon, key: "safeDealTipMeeting" },
];

const SafeDealTipsDialog = ({ open, onOpenChange, onContinue }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <div className="bg-muted/40 flex items-center justify-center py-6">
          <WarningIcon size={36} weight="fill" className="text-amber-500" />
        </div>
        <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
          <h2 className="text-center font-bold text-lg">{t("tipsForSafeDeal")}</h2>
          <div className="flex flex-col divide-y">
            {tips.map(({ icon: Icon, key }, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3">
                <Icon size={20} className="text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">{t(key)}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={onContinue}
            className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
          >
            {t("continueToCall")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SafeDealTipsDialog;
