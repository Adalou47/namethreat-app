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
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        Category
      </span>
      <Link
        href={buildUrl({ category: null, difficulty: currentDifficulty, country: currentCountry })}
        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 ${!currentCategory ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800" : "border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-50"}`}
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
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 ${isSelected ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800" : "border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-50"}`}
          >
            {getCategoryDisplayName(c) || c}
          </Link>
        );
      })}
      <span className="ml-2 border-l border-neutral-200 pl-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
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
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 ${isSelected ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800" : "border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-50"}`}
          >
            {label}
          </Link>
        );
      })}
      <span className="ml-2 border-l border-neutral-200 pl-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
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
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 ${isSelected ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800" : "border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-50"}`}
          >
            {c}
          </Link>
        );
      })}
    </div>
  );
}
