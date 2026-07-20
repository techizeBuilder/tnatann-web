"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CurrentLanguageData,
} from "@/redux/reducer/languageSlice";
import { getDefaultLanguageCode, getLanguages } from "@/redux/reducer/settingSlice";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import CustomImage from "./CustomImage";
import { setHasFetchedCategories, setHasFetchedSystemSettings } from "@/utils/getFetcherStatus";
import { truncate, updateStickyNoteTranslations } from "@/utils";
import { getIsFetchingLanguage } from "@/redux/reducer/globalStateSlice";

const LanguageDropdown = () => {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { lang } = useParams();
  const defaultLangCode = useSelector(getDefaultLanguageCode);
  const CurrentLanguage = useSelector(CurrentLanguageData);
  const languages = useSelector(getLanguages);
  const isRTL = CurrentLanguage.rtl;
  const isFetchingLanguage = useSelector(getIsFetchingLanguage);

  const handleLanguageSelect = (selectedLang) => {
    if (CurrentLanguage.id === selectedLang.id) return;

    const newLangCode = selectedLang.code.toLowerCase();

    // extract page path without lang prefix
    const pagePath = lang === defaultLangCode
      ? pathname
      : pathname.slice(`/${lang}`.length) || "/";

    // default lang = no prefix, others = /{lang}{pagePath}
    const newPath = newLangCode === defaultLangCode
      ? pagePath
      : `/${newLangCode}${pagePath}`;

    const queryString = searchParams.toString();
    const finalPath = queryString ? `${newPath}?${queryString}` : newPath;
    setHasFetchedSystemSettings(false);
    setHasFetchedCategories(false);
    updateStickyNoteTranslations();
    router.push(finalPath, { scroll: false });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isFetchingLanguage} className="border rounded-full py-2 px-4">
        <div className="flex items-center gap-1">
          <CustomImage
            key={CurrentLanguage?.id}
            src={CurrentLanguage?.image}
            alt={CurrentLanguage?.name || "language"}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span>{truncate(CurrentLanguage?.name, 12)}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-0 max-h-62.5 overflow-y-auto"
        align={isRTL ? "start" : "end"}
      >
        {languages &&
          languages.map((lang) => (
            <DropdownMenuItem
              key={lang?.id}
              onClick={() => handleLanguageSelect(lang)}
              className="cursor-pointer"
            >
              <CustomImage
                src={lang?.image}
                alt={lang.name || "english"}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
