"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomImage from "@/components/Common/CustomImage";
import CustomLink from "@/components/Common/CustomLink";
import { XIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { t } from "@/utils";
import { useUpdateLocationInUrl } from "@/components/Hooks/useUpdateLocationInUrl";
import { usePathname } from "next/navigation";

const MAX_VISIBLE = 8;

const SubcategoryModal = ({ category, onClose }) => {
  const { generateAdsUrl } = useUpdateLocationInUrl();
  const pathname = usePathname();
  const isAdsPage = pathname.includes("/ads");

  const buildUrl = (slug) =>
    generateAdsUrl({ category: slug }, !isAdsPage);

  // subcategories come directly from the popular-categories API response
  const subcategories = category?.subcategories || [];

  return (
    <Dialog open={!!category} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-lg [&>button]:hidden p-0 overflow-hidden border-none shadow-2xl">
        <DialogTitle className="sr-only">
          {category?.translated_name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {category?.translated_name}
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b">
          <div className="flex items-center gap-2">
            {category?.image && (
              <CustomImage
                src={category.image}
                width={28}
                height={28}
                alt={category.translated_name || ""}
                className="size-7 aspect-square rounded-full object-contain"
              />
            )}
            <h3 className="font-semibold text-base">
              {category?.translated_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <XIcon size={20} weight="bold" className="text-muted-foreground" />
          </button>
        </div>

        {/* Subcategory grid */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-x-4 gap-y-5">
            {subcategories.slice(0, MAX_VISIBLE).map((sub) => (
              <CustomLink
                key={sub.id}
                href={buildUrl(`${category.slug}/${sub.slug}`)}
                onClick={onClose}
                className="flex flex-col items-center gap-2 text-center group"
              >
                <div className="border rounded-full overflow-hidden group-hover:border-primary transition-colors">
                  <CustomImage
                    src={sub.image}
                    width={72}
                    height={72}
                    className="aspect-square w-full rounded-full object-contain bg-muted"
                    alt={sub.translated_name || "Subcategory"}
                  />
                </div>
                <p className="text-xs sm:text-sm line-clamp-2 font-medium leading-tight">
                  {sub.translated_name}
                </p>
              </CustomLink>
            ))}

            {/* View All — shown when subcategories exceed MAX_VISIBLE */}
            {subcategories.length > MAX_VISIBLE && (
              <CustomLink
                href={buildUrl(category?.slug)}
                onClick={onClose}
                className="flex flex-col items-center gap-2 text-center group"
              >
                <div
                  className="border rounded-full overflow-hidden flex items-center justify-center bg-muted group-hover:border-primary transition-colors"
                  style={{ width: 72, height: 72 }}
                >
                  <ArrowRightIcon size={28} weight="bold" className="text-primary" />
                </div>
                <p className="text-xs sm:text-sm font-medium leading-tight">
                  {t("viewAll")}
                </p>
              </CustomLink>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubcategoryModal;
