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
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <h3 className="font-semibold text-neutral-950">{t.name ?? "Unnamed"}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.category && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                {getCategoryDisplayName(t.category) || t.category}
              </span>
            )}
            {t.difficulty && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  t.difficulty === "Easy"
                    ? "bg-green-50 text-green-600"
                    : t.difficulty === "Medium"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-500"
                }`}
              >
                {t.difficulty}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {t.target_country && <span>{t.target_country}</span>}
            {t.target_country && t.language && " · "}
            {t.language && <span>{t.language}</span>}
          </div>
          <Link
            href={`/dashboard/templates/${t.id}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-50 transition-colors duration-150"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </div>
      ))}
    </div>
  );
}
