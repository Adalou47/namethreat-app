import Link from "next/link";
import { Eye } from "lucide-react";
import { getCategoryDisplayName } from "@/lib/category-display";

type Template = {
  id: string;
  name: string | null;
  category: string | null;
  difficulty: string | null;
  target_country: string | null;
  language: string | null;
};

export function TemplatesGrid({ templates }: { templates: Template[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <div
          key={t.id}
          className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4"
        >
          <h3 className="font-semibold text-[#000000]">{t.name ?? "Unnamed"}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.category && (
              <span className="rounded-[4px] bg-white px-2 py-0.5 text-xs text-[#6b6b6b]">
                {getCategoryDisplayName(t.category) || t.category}
              </span>
            )}
            {t.difficulty && (
              <span
                className={`rounded-[4px] px-2 py-0.5 text-xs font-medium ${
                  t.difficulty === "Easy"
                    ? "bg-green-100 text-green-800"
                    : t.difficulty === "Medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {t.difficulty}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-[#6b6b6b]">
            {t.target_country && <span>{t.target_country}</span>}
            {t.target_country && t.language && " · "}
            {t.language && <span>{t.language}</span>}
          </div>
          <Link
            href={`/dashboard/templates/${t.id}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[4px] border border-[#e5e5e5] bg-white py-2 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5]"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </div>
      ))}
    </div>
  );
}
