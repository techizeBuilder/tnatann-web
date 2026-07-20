import { useState } from "react";
import { deleteChatApi } from "@/utils/api";
import { toast } from "sonner";
import { t } from "@/utils";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/components/Hooks/useNavigate";

const useChatSelectMode = ({
  chatListData,
  setChatListData,
  setSelectedChatDetails,
  isSelling,
}) => {
  const searchParams = useSearchParams();
  const { navigate } = useNavigate();
  const chatId = Number(searchParams.get("chatid")) || "";

  const [selectMode, setSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteChatApi.deleteChat({ item_offer_id: selectedChats });
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        const newTotal = chatListData.total - selectedChats.length;
        const params = new URLSearchParams(searchParams.toString());
        setChatListData((prev) => ({
          ...prev,
          list: prev.list.filter((item) => !selectedChats.includes(item.id)),
          total: prev.total - selectedChats.length,
        }));
        const activeDeleted = chatId && selectedChats.includes(chatId);
        if (activeDeleted) {
          params.delete("chatid");
          params.delete("lang");
          if (newTotal === 0 && isSelling) params.delete("chat_ad_id");
          setSelectedChatDetails({});
          navigate(`/chat?${params.toString()}`, { scroll: false });
        } else if (newTotal === 0 && !chatId) {
          params.delete("lang");
          if (isSelling) params.delete("chat_ad_id");
          setSelectedChatDetails({});
          navigate(`/chat?${params.toString()}`, { scroll: false });
        }
        setSelectMode(false);
        setSelectedChats([]);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somthingWentWrong"));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return {
    selectMode,
    setSelectMode,
    selectedChats,
    setSelectedChats,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    handleBulkDelete,
  };
};

export default useChatSelectMode;
