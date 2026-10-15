export const slugifyCategory = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const LEGAL_CATEGORY_SLUG = "legal-privacy-information";
