"use client";
import { MdChevronRight } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { t } from "@/utils";
import CustomImage from "@/components/Common/CustomImage";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

const CategorySelectToListAd = ({
  categories,
  categoriesLoading,
  fetchMoreCategory,
  lastPage,
  currentPage,
  isLoadMoreCat,
  handleCategoryTabClick,
}) => {
  return (
    <>
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-0 sm:gap-6">
        {categoriesLoading ? (
          <div className="col-span-12 py-28">
            <Loader />
          </div>
        ) : (
          categories?.map((category, index) => {
            const isLastCategory = categories.length - 1 !== index
            return (
              <Fragment key={category?.id}>
                <div
                  className={cn("flex justify-between items-center cursor-pointer px-2 py-4 sm:p-0")}
                  onClick={() => handleCategoryTabClick(category)}
                >
                  <div className="flex items-center gap-2 ">
                    <CustomImage
                      src={category?.image}
                      alt={category?.translated_name || category?.name}
                      height={48}
                      width={48}
                      className="h-12 w-12 rounded-full"
                    />
                    <span className="ltr:text-left rtl:text-right break-all">
                      {category?.translated_name || category?.name}
                    </span>
                  </div>
                  {category?.subcategories?.length > 0 && (
                    <MdChevronRight size={24} className="rtl:scale-x-[-1]" />
                  )}
                </div>
                {
                  isLastCategory &&
                  <Separator className='col-span-1 sm:hidden' />
                }
              </Fragment>
            );
          })
        )}
      </div>

      {!categoriesLoading && lastPage > currentPage && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isLoadMoreCat || categoriesLoading}
            onClick={fetchMoreCategory}
          >
            {isLoadMoreCat ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
};

export default CategorySelectToListAd;

const Loader = () => {
  return (
    <div className="flex justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute w-12 h-12 bg-primary rounded-full animate-ping"></div>
        <div className="absolute w-12 h-12 bg-primary rounded-full animate-ping delay-1000"></div>
      </div>
    </div>
  );
};
