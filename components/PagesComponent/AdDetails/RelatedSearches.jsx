import CustomLink from "@/components/Common/CustomLink";
import { formatPriceAbbreviated, t } from "@/utils";
import { CaretRightIcon } from "@phosphor-icons/react";

const RelatedSearches = ({ productDetails, filteredFields }) => {
  const category = productDetails?.category;
  const categorySlug = category?.slug;
  const categoryName = category?.translated_name || category?.name;
  const city = productDetails?.translated_city || productDetails?.city;

  if (!categorySlug || !categoryName) return null;

  const cityLabel = city ? ` ${t("in")} ${city}` : "";
  const citySearchParam = city ? `city=${encodeURIComponent(city)}` : "";

  const links = [
    {
      label: `${t("used")} ${categoryName}${cityLabel}`,
      href: citySearchParam
        ? `/ads/${categorySlug}?${citySearchParam}`
        : `/ads/${categorySlug}`,
    },
  ];

  const usableFields = (filteredFields || [])
    .filter(
      (field) =>
        typeof field.translated_selected_values === "string" &&
        field.translated_selected_values.trim()
    )
    .slice(0, 2);

  usableFields.forEach((field) => {
    const value = field.translated_selected_values;
    const params = [citySearchParam, `${field.id}=${encodeURIComponent(value)}`]
      .filter(Boolean)
      .join("&");
    links.push({
      label: `${t("used")} ${value} ${categoryName}${cityLabel}`,
      href: `/ads/${categorySlug}?${params}`,
    });
  });

  if (productDetails?.price) {
    const price = Number(productDetails.price);
    if (price > 0) {
      const magnitude =
        price < 1000 ? 100 : price < 10000 ? 1000 : price < 100000 ? 10000 : 100000;
      const ceiling = Math.ceil(price / magnitude) * magnitude;
      const params = [citySearchParam, `max_price=${ceiling}`]
        .filter(Boolean)
        .join("&");
      links.push({
        label: `${t("used")} ${categoryName} ${t("under")} ${formatPriceAbbreviated(
          ceiling
        )}${cityLabel}`,
        href: `/ads/${categorySlug}?${params}`,
      });
    }
  }

  return (
    <div className="bg-muted/40 rounded-lg p-4">
      <div className="flex flex-wrap gap-3">
        {links.map((link, idx) => (
          <CustomLink
            key={idx}
            href={link.href}
            className="bg-white border rounded-md px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-blue-900 hover:border-blue-900 transition-colors"
          >
            {link.label}
            <CaretRightIcon size={14} weight="bold" />
          </CustomLink>
        ))}
      </div>
    </div>
  );
};

export default RelatedSearches;
