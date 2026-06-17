import { formatTime, t } from "@/utils";
import CustomLink from "@/components/Common/CustomLink";
import CustomImage from "@/components/Common/CustomImage";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { blockUserApi, unBlockUserApi } from "@/utils/api";
import useChatSelectMode from "./useChatSelectMode";
import { toast } from "sonner";
import ReusableAlertDialog from "@/components/Common/ReusableAlertDialog";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/redux/reducer/languageSlice";

const ChatListCard = ({
  chat,
  isSelling,
  isActive = false,
  setSelectedChat,
  handleChatTabClick,
  chatAdId,
  totalChats,
  setChatListData,
  selectMode,
  selectedChats,
  setSelectedChats,
  setSelectMode,
}) => {
  const user = isSelling ? chat?.buyer : chat?.seller;
  const isUnread = chat?.unread_chat_count > 0;
  const isBlocked = chat?.user_blocked;
  const isSelected = selectedChats?.includes(chat?.id);

  const {
    setSelectedChats: setDeleteChatIds,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isDeleting, handleBulkDelete,
  } = useChatSelectMode({
    chatListData: { total: totalChats },
    setChatListData,
    setSelectedChatDetails: setSelectedChat,
    isSelling,
  });

  const toggleSelection = () => {
    setSelectedChats((prev) =>
      isSelected ? prev.filter((id) => id !== chat.id) : [...prev, chat.id]
    );
  };

  const handleSelectClick = () => {
    setSelectMode(true);
    setSelectedChats([chat.id]);
  };
  const isRTL = useSelector(getIsRtl);

  const getHref = () => {
    return `/chat?activeTab=${isSelling ? "selling" : "buying"
      }&chatid=${chat?.id}&chat_ad_id=${chatAdId}`;
  };
  const handleBlockUser = async (id) => {
    try {
      const response = await blockUserApi.blockUser({
        blocked_user_id: user?.id,
      });

      if (response?.data?.error === false) {
        if (isActive) {
          setSelectedChat((prevData) => ({
            ...prevData,
            user_blocked: true,
          }));
        }
        setChatListData((prev) => ({
          ...prev,
          list: prev.list.map((item) =>
            item.id === chat.id ? { ...item, user_blocked: true } : item
          ),
        }));
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleUnBlockUser = async (id) => {
    try {
      const response = await unBlockUserApi.unBlockUser({
        blocked_user_id: user?.id,
      });
      if (response?.data.error === false) {
        if (isActive) {
          setSelectedChat((prevData) => ({
            ...prevData,
            user_blocked: false,
          }));
        }
        setChatListData((prev) => ({
          ...prev,
          list: prev.list.map((item) =>
            item.id === chat.id ? { ...item, user_blocked: false } : item
          ),
        }));
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openDeleteModal = () => {
    setDeleteChatIds([chat.id]);
    setIsDeleteModalOpen(true);
  };

  return (
    <div
      className={cn(
        "relative border-b transition-colors group",
        isActive ? "bg-primary text-white" : "hover:bg-muted",
        selectMode && isSelected && (isActive ? "border-l-4 border-white" : "bg-primary/10 border-l-4 border-primary")
      )}
    >
      {/* Clickable Card Area */}
      <CustomLink
        scroll={false}
        href={getHref()}
        onClick={(e) => {
          if (selectMode) { e.preventDefault(); toggleSelection(); return; }
          handleChatTabClick(chat, isSelling);
        }}
        className="block"
      >
        <div className="py-3 px-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <CustomImage
              src={isSelling ? user.profile : chat?.item?.image}
              alt={isSelling ? (user?.name || 'user') : (chat?.item?.name || 'item')}
              width={56}
              height={56}
              className="w-14 aspect-square object-cover rounded-full"
            />
            {!isSelling &&
              <CustomImage
                src={user.profile}
                alt={user?.name || 'user'}
                width={24}
                height={24}
                className="w-6 h-auto aspect-square object-cover rounded-full absolute top-8 -bottom-1.5 ltr:-right-1.5 rtl:-left-1.5"
              />
            }
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 w-full min-w-0">
            {/* Top Row */}
            <div className="w-full flex items-center justify-between min-w-0">
              <h5 className="font-medium truncate" title={isSelling ? user?.name : chat?.item?.translated_name}>
                {isSelling ? user?.name : chat?.item?.translated_name}
              </h5>

              <span
                className={cn(
                  "text-xs transition-opacity group-hover:opacity-0",
                  isActive
                    ? "text-white/80"
                    : "text-muted-foreground"
                )}
              >
                {formatTime(chat?.last_message_time)}
              </span>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between gap-2 min-w-0">

              {
                !isSelling ? (
                  <p
                    className={cn(
                      "truncate text-sm",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground"
                    )}
                    title={chat?.seller?.name}
                  >
                    {chat?.seller?.name}
                  </p>
                )
                  :
                  (
                    chat?.last_chat_message ? (
                      <p
                        className={cn(
                          "truncate text-sm",
                          isActive
                            ? "text-white"
                            : "text-muted-foreground"
                        )}
                        title={chat?.last_chat_message}
                      >
                        {chat?.last_chat_message}
                      </p>
                    ) : (
                      <div />
                    )
                  )
              }
              {isUnread && !isActive && (
                <span className="flex items-center justify-center bg-primary text-white rounded-full px-2 py-1 text-xs shrink-0">
                  {chat?.unread_chat_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </CustomLink>

      {/* Dropdown (OUTSIDE the link) */}
      {!selectMode && (
        <div className="absolute ltr:right-4 rtl:left-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "p-1 rounded-full transition duration-150 opacity-0 group-hover:opacity-100",
                  isActive
                    ? "hover:bg-blue-100/20"
                    : "hover:bg-gray-200"
                )}
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={handleSelectClick}>
                {t("select")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={isBlocked ? handleUnBlockUser : handleBlockUser}
              >
                {isBlocked ? t("unblock") : t("block")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={openDeleteModal}
              >
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ReusableAlertDialog
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("deleteChat")}
        description={t("deleteChatDescription")}
        confirmText={t("delete")}
        confirmDisabled={isDeleting}
      />
    </div>
  );
};

export default ChatListCard;