import CustomLink from "@/components/Common/CustomLink";
import CustomImage from "@/components/Common/CustomImage";
import { useUpdateLocationInUrl } from "@/components/Hooks/useUpdateLocationInUrl";

const PopularCategoryCard = ({
  item,
  useHeaderLocation = true,
  slugPrefix,
  onCategoryClick,
}) => {
  const { generateAdsUrl } = useUpdateLocationInUrl();
  const fullSlug = slugPrefix ? `${slugPrefix}/${item?.slug}` : item?.slug;

  const inner = (
    <>
      <div className="border rounded-full">
        <CustomImage
          src={item?.image}
          width={96}
          height={96}
          className="aspect-square w-full rounded-full object-contain bg-muted"
          alt={item?.translated_name || "Category"}
          loading="eager"
        />
      </div>
      <p className="text-sm sm:text-base line-clamp-2 font-medium text-center leading-tight">
        {item?.translated_name}
      </p>
    </>
  );

  // API returns subcategories_count and subcategories[] directly
  // If has subcategories → open modal; otherwise → navigate directly
  if (item?.subcategories_count > 0 && onCategoryClick) {
    return (
      <button
        onClick={() => onCategoryClick(item)}
        className="flex flex-col gap-4 w-full items-center cursor-pointer"
      >
        {inner}
      </button>
    );
  }

  return (
    <CustomLink
      href={generateAdsUrl({ category: fullSlug }, useHeaderLocation)}
      className="flex flex-col gap-4"
    >
      {inner}
    </CustomLink>
  );
};

export default PopularCategoryCard;
