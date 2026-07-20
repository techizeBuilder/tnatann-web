import CustomImage from "@/components/Common/CustomImage";
import { Button } from "@/components/ui/button";
import { t } from "@/utils";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import noConversation from "@/public/assets/no_conversation.svg"

const NoChatFound = ({ handleBack }) => {
  return (
    <div className="flex flex-col gap-3 text-center items-center justify-center">
      <CustomImage
        src={noConversation}
        alt="no conversation"
        width={296}
        height={237}
      />
      <h5 className="text-primary text-2xl font-medium">{t("noConversationSelectedYet")}</h5>
      <p className="text-muted-foreground max-w-80">{t("pickAConversation")}</p>
      <Button className="w-fit" onClick={handleBack}>
        <ArrowLeftIcon weight="bold" className="size-5! rtl:scale-x-[-1]" />
        {t("back")}
      </Button>
    </div>
  );
};

export default NoChatFound;
