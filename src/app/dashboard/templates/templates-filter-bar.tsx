import Link from "next/link";
import { getCategoryDisplayName } from "@/lib/category-display";

// DB stores difficulty as lowercase; use these for URL/query and display label
const DIFFICULTIES: { value: string; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
const COUNTRIES = ["US", "UK", "DE", "FR", "AU"];

type Props = {
  categoryList: string[];
  currentCategory?: string;
  currentDifficulty?: string;
  currentCountry?: string;
};

function buildUrl(params: { category?: string | null; difficulty?: string | null; country?: string | null }) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.difficulty) search.set("difficulty", params.difficulty);
  if (params.country) search.set("country", params.country);
  const q = search.toString();
  return `/dashboard/templates${q ? `?${q}` : ""}`;
}

export function TemplatesFilterBar({
  categoryList,
  currentCategory,
  currentDifficulty,
  currentCountry,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
        Category
      </span>
      <Link
        href={buildUrl({ category: null, difficulty: currentDifficulty, country: currentCountry })}
        className={`rounded-[4px] border px-3 py-1.5 text-sm ${!currentCategory ? "border-[#000000] bg-[#000000] text-white" : "border-[#e5e5e5] bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
      >
        All
      </Link>
      {categoryList.map((c) => {
        const isSelected = currentCategory === c;
        return (
          <Link
            key={c}
            href={buildUrl({
              category: isSelected ? undefined : c,
              difficulty: currentDifficulty,
              country: currentCountry,
            })}
            className={`rounded-[4px] border px-3 py-1.5 text-sm ${isSelected ? "border-[#000000] bg-[#000000] text-white" : "border-[#e5e5e5] bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
          >
            {getCategoryDisplayName(c) || c}
          </Link>
        );
      })}
      <span className="ml-2 border-l border-[#e5e5e5] pl-3 text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
        Difficulty
      </span>
      {DIFFICULTIES.map(({ value, label }) => {
        const isSelected = currentDifficulty === value;
        return (
          <Link
            key={value}
            href={buildUrl({
              category: currentCategory,
              difficulty: isSelected ? undefined : value,
              country: currentCountry,
            })}
            className={`rounded-[4px] border px-3 py-1.5 text-sm ${isSelected ? "border-[#000000] bg-[#000000] text-white" : "border-[#e5e5e5] bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
          >
            {label}
          </Link>
        );
      })}
      <span className="ml-2 border-l border-[#e5e5e5] pl-3 text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
        Country
      </span>
      {COUNTRIES.map((c) => {
        const isSelected = currentCountry === c;
        return (
          <Link
            key={c}
            href={buildUrl({
              category: currentCategory,
              difficulty: currentDifficulty,
              country: isSelected ? undefined : c,
            })}
            className={`rounded-[4px] border px-3 py-1.5 text-sm ${isSelected ? "border-[#000000] bg-[#000000] text-white" : "border-[#e5e5e5] bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
          >
            {c}
          </Link>
        );
      })}
    </div>
  );
}
