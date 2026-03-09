import Link from "next/link";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const COUNTRIES = ["US", "UK", "DE", "FR", "AU"];

type Props = {
  categoryList: string[];
  currentCategory?: string;
  currentDifficulty?: string;
  currentCountry?: string;
};

function buildUrl(params: { category?: string; difficulty?: string; country?: string }) {
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
        href={buildUrl({ difficulty: currentDifficulty, country: currentCountry })}
        className={`rounded-[4px] px-3 py-1.5 text-sm ${!currentCategory ? "bg-[#000000] text-white" : "bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
      >
        All
      </Link>
      {categoryList.map((c) => (
        <Link
          key={c}
          href={buildUrl({ category: c, difficulty: currentDifficulty, country: currentCountry })}
          className={`rounded-[4px] px-3 py-1.5 text-sm ${currentCategory === c ? "bg-[#000000] text-white" : "bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
        >
          {c}
        </Link>
      ))}
      <span className="ml-2 border-l border-[#e5e5e5] pl-3 text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
        Difficulty
      </span>
      {DIFFICULTIES.map((d) => (
        <Link
          key={d}
          href={buildUrl({ category: currentCategory, difficulty: d, country: currentCountry })}
          className={`rounded-[4px] px-3 py-1.5 text-sm ${currentDifficulty === d ? "bg-[#000000] text-white" : "bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
        >
          {d}
        </Link>
      ))}
      <span className="ml-2 border-l border-[#e5e5e5] pl-3 text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
        Country
      </span>
      {COUNTRIES.map((c) => (
        <Link
          key={c}
          href={buildUrl({ category: currentCategory, difficulty: currentDifficulty, country: c })}
          className={`rounded-[4px] px-3 py-1.5 text-sm ${currentCountry === c ? "bg-[#000000] text-white" : "bg-white text-[#000000] hover:bg-[#e5e5e5]"}`}
        >
          {c}
        </Link>
      ))}
    </div>
  );
}
