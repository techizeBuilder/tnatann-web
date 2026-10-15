"use client";
import { sendMessageApi } from "@/utils/api";
import { useEffect, useMemo, useState, useRef } from "react";
import { CircleNotchIcon, MicrophoneIcon, PaperPlaneRightIcon, StopCircleIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useReactMediaRecorder } from "react-media-recorder";
import { toast } from "sonner";
import { t } from "@/utils";
import { cn } from "@/lib/utils";
import CustomImage from "@/components/Common/CustomImage";

const SendMessage = ({ selectedChatDetails, setChatMessages, setSelectedChatDetails, setChatListData }) => {
  const isAllowToChat =
    selectedChatDetails?.item?.status === "approved" ||
    selectedChatDetails?.item?.status === "featured";

  if (!isAllowToChat) {
    return (
      <div className="p-4 border-t text-center text-muted-foreground">
        {t("thisAd")} {selectedChatDetails?.item?.status}
      </div>
    );
  }

  if (selectedChatDetails?.user_blocked || selectedChatDetails?.is_my_user_blocked) {
    return (
      <div className="p-4 border-t text-center text-muted-foreground">
        {selectedChatDetails?.user_blocked ? t("youBlockedThisContact") : t('youveBeenBlockedByThisUser')}
      </div>
    );
  }

  if (selectedChatDetails?.is_my_user_blocked) {
    return (
      <div className="p-4 border-t text-center text-muted-foreground">
        {t("youBlockedThisContact")}
      </div>
    );
  }

  const id = selectedChatDetails?.id;
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  // Voice recording setup
  const { status, startRecording, stopRecording, mediaBlobUrl, error } =
    useReactMediaRecorder({
      audio: true,
      blobPropertyBag: { type: "audio/mpeg" },
    });

  const isRecording = status === "recording";
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Format recording duration as mm:ss
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Timer for recording
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      stopRecording();
    };
  }, []);

  // Handle recorded audio
  useEffect(() => {
    if (mediaBlobUrl && status === "stopped") {
      handleRecordedAudio();
    }
  }, [mediaBlobUrl, status]);

  const handleRecordedAudio = async () => {
    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const audioFile = new File([blob], "recording.mp3", {
        type: "audio/mpeg",
      });
      sendMessage(audioFile);
    } catch (err) {
      console.error("Error processing audio:", err);
      toast.error("Failed to process recording");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPEG, PNG, JPG) are allowed");
      return;
    }

    // Create preview URL for image
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (audioFile = null, textOverride = null) => {
    const textToSend = textOverride !== null ? textOverride : message;
    if ((!textToSend.trim() && !selectedFile && !audioFile) || isSending) return;

    const params = {
      item_offer_id: id,
      message: textToSend ? textToSend : "",
      file: selectedFile ? selectedFile : "",
      audio: audioFile ? audioFile : "",
    };

    try {
      setIsSending(true);
      const response = await sendMessageApi.sendMessage(params);
      if (!response?.data?.error) {
        setChatMessages((prev) => [...prev, response.data.data]);
        setMessage("");
        removeSelectedFile();
      } else if (response?.data?.data?.key === 'blocked_by_other_user') {
        toast.error(t("youveBeenBlockedByThisUser"));
        setSelectedChatDetails((prev) => ({
          ...prev,
          is_my_user_blocked: true,
        }));
      } else {
        toast.error(response?.data?.message || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      if (error) {
        console.log(error);
        switch (error) {
          case "permission_denied":
            toast.error(t("microphoneAccessDenied"));
            break;
          case "no_specified_media_found":
            toast.error(t("noMicrophoneFound"));
            break;
          default:
            toast.error(t("somethingWentWrong"));
        }
      }
    }
  };

  const quickReplyCategories = useMemo(
    () => [
      {
        key: "popular",
        label: t("quickReplyTabPopular"),
        replies: [
          t("quickReplyIsStillAvailable"),
          t("quickReplyLetsMeetUp"),
          t("quickReplyCurrentLocation"),
          t("quickReplySharePictures"),
          t("quickReplyDealerOrOwner"),
        ],
      },
      {
        key: "rc",
        label: t("quickReplyTabRC"),
        replies: [
          t("quickReplyHaveRC"),
          t("quickReplyRcInYourName"),
          t("quickReplyNumberOfOwners"),
          t("quickReplyLoanOnRc"),
          t("quickReplyRcTransferPossible"),
          t("quickReplyDuplicateKeys"),
        ],
      },
      {
        key: "carCondition",
        label: t("quickReplyTabCarCondition"),
        replies: [
          t("quickReplyAccidentHistory"),
          t("quickReplyEngineCondition"),
          t("quickReplyRepainting"),
          t("quickReplyTyreCondition"),
          t("quickReplyServiceHistory"),
        ],
      },
      {
        key: "insurance",
        label: t("quickReplyTabInsurance"),
        replies: [
          t("quickReplyInsuranceValid"),
          t("quickReplyInsuranceType"),
          t("quickReplyInsuranceExpiry"),
          t("quickReplyInsuranceTransferable"),
          t("quickReplyNoClaimBonus"),
        ],
      },
      {
        key: "paymentMode",
        label: t("quickReplyTabPaymentMode"),
        replies: [
          t("quickReplyOnlinePayment"),
          t("quickReplyEmiAvailable"),
          t("quickReplyExchangeOffer"),
        ],
      },
      {
        key: "photo",
        label: t("quickReplyTabPhoto"),
        replies: [t("quickReplySharePictures"), t("quickReplyShareVideo")],
      },
      {
        key: "user",
        label: t("quickReplyTabUser"),
        replies: [t("quickReplyDealerOrOwner"), t("quickReplyWhySelling")],
      },
      {
        key: "fuelType",
        label: t("quickReplyTabFuelType"),
        replies: [t("quickReplyFuelType"), t("quickReplyMileage")],
      },
    ],
    []
  );

  const [activeQuickReplyTab, setActiveQuickReplyTab] = useState(0);
  const activeReplies = quickReplyCategories[activeQuickReplyTab]?.replies || [];

  return (
    <div className="flex flex-col">
      {/* Quick Replies */}
      {!isRecording && (
        <div className="bg-muted/40 border-t">
          <div className="flex items-center gap-1 overflow-x-auto bg-blue-900 px-2">
            {quickReplyCategories.map((cat, idx) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveQuickReplyTab(idx)}
                className={cn(
                  "shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  idx === activeQuickReplyTab
                    ? "border-white text-white font-semibold"
                    : "border-transparent text-white/70 hover:text-white"
                )}
              >
                {cat.label} ({cat.replies.length})
              </button>
            ))}
          </div>
          <div className="px-4 pt-3 pb-1">
            <p className="text-sm font-semibold">
              {quickReplyCategories[activeQuickReplyTab]?.label}
            </p>
            <div className="flex flex-wrap gap-2 py-2">
              {activeReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  disabled={isSending}
                  onClick={() => sendMessage(null, reply)}
                  className="text-sm border rounded-md px-3 py-1.5 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {previewUrl && (
        <div className="px-4 pt-2 pb-1">
          <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
            <CustomImage
              src={previewUrl}
              alt="File preview"
              fill
              className="object-contain"
            />
            <button
              onClick={removeSelectedFile}
              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-70 hover:opacity-100"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t flex items-center gap-2">
        {!isRecording && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              aria-label="Attach file"
            >
              <UploadSimpleIcon size={20} className="text-muted-foreground" weight="bold" />
            </button>
          </>
        )}

        {isRecording ? (
          <div className="flex-1 py-2 px-3 bg-red-50 text-red-500 rounded-md flex items-center justify-center font-medium">
            {t("recording")} {formatDuration(recordingDuration)}
          </div>
        ) : (
          <textarea
            type="text"
            placeholder="Message..."
            className="flex-1 outline-hidden border px-3 py-1 rounded-md"
            value={message}
            rows={2}
            onChange={(e) => setMessage(e.target.value)}
          />
        )}

        <button
          className="p-2 bg-primary text-white rounded-md"
          disabled={isSending}
          onClick={
            message.trim() || selectedFile
              ? () => sendMessage()
              : handleVoiceButtonClick
          }
        >
          {isSending ? (
            <CircleNotchIcon size={20} className="animate-spin" weight="bold" />
          ) : message.trim() || selectedFile ? (
            <PaperPlaneRightIcon size={20} className="rtl:scale-x-[-1]" weight="fill" />
          ) : isRecording ? (
            <StopCircleIcon size={20} weight="bold" />
          ) : (
            <MicrophoneIcon size={20} weight="fill" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SendMessage;
