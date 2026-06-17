import { t, formatPriceAbbreviated } from "@/utils";
import { getPackageVars } from "@/utils/getPackageVars";
import { Separator } from "@/components/ui/separator";
import CustomImage from "@/components/Common/CustomImage";
import { FaCheck } from "react-icons/fa";

const SelectedPlan = ({ selectedPackage }) => {
    const { descriptionItems, totalDays, totalItems, listingDurationDays } = getPackageVars(selectedPackage);

    return (
        <div>
            <h4 className="text-xl font-medium">{t("selectedPlan")}</h4>

            {/* Package Card */}
            <div className="p-4 border rounded-md mt-6">
                <div className="flex items-center gap-4">
                    <CustomImage
                        height={80}
                        width={80}
                        src={selectedPackage?.icon}
                        alt="Package Icon"
                        className="aspect-square rounded-lg"
                    />
                    <div className="flex flex-col gap-2 overflow-hidden">
                        <h2 className="text-xl font-medium mb-1 line-clamp-2">
                            {selectedPackage?.translated_name || selectedPackage?.name}
                        </h2>
                        <div className="flex items-center gap-1">
                            {selectedPackage?.final_price !== 0 ? (
                                <p className="text-xl font-bold">{formatPriceAbbreviated(selectedPackage?.final_price)}</p>
                            ) : t("Free")}
                            {selectedPackage?.price > selectedPackage?.final_price && (
                                <p className="text-xl font-bold line-through text-muted-foreground">
                                    {formatPriceAbbreviated(selectedPackage?.price)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t pt-4 mt-4 flex items-center justify-between gap-2">
                    <span className="font-bold">
                        {totalItems === "unlimited" ? t("unlimited") : totalItems} {t("ads")}
                    </span>
                    <span className="text-xs rounded text-muted-foreground capitalize px-2 py-1 bg-muted">
                        {totalDays} {t("days")}
                    </span>
                </div>
            </div>

            {/* Features */}
            <div className="mt-6">
                <h4 className="text-sm font-bold text-muted-foreground">{t("featuresIncludes")}</h4>
                <div className="flex flex-col gap-2 mt-4 text-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-primary"><FaCheck /></span>
                        <span className="capitalize">{t("listingDuration")}: {listingDurationDays} {t("days")}</span>
                    </div>
                    {descriptionItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <span className="text-primary"><FaCheck /></span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="mt-6" />

            {/* Categories */}
            <div className="mt-6">
                <h6 className="text-sm font-bold text-muted-foreground">{t("categoryIncludes")}</h6>
                <div className="flex flex-col gap-2 text-sm mt-4">
                    {selectedPackage?.categories?.length > 0 ? (
                        selectedPackage.categories.map((category) => (
                            <div key={category.id} className="flex items-center gap-3">
                                <span className="text-primary"><FaCheck /></span>
                                <span>{category.translated_name || category.name}</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-primary"><FaCheck /></span>
                            <span>{t("allCategoriesIncluded")}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectedPlan;