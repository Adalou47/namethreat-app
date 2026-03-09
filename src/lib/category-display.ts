const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  invoice: "Invoice",
  credential: "Credential Theft",
  it_support: "IT Support",
  hr: "HR",
  executive: "Executive",
  delivery: "Delivery",
  banking: "Banking",
  government: "Government",
  social: "Social Media",
  other: "Other",
};

export function getCategoryDisplayName(category: string | null | undefined): string {
  if (!category) return "";
  return CATEGORY_DISPLAY_NAMES[category] ?? category;
}
