import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Mail, Eye } from "lucide-react";
import { TemplatesFilterBar } from "./templates-filter-bar";
import { TemplatesGrid } from "./templates-grid";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string; country?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("organisation_id, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser || (dbUser.organisation_id == null && dbUser.msp_id == null)) redirect("/onboarding/msp");

  const raw = await searchParams;
  const category = typeof raw.category === "string" ? raw.category : Array.isArray(raw.category) ? raw.category[0] : undefined;
  const difficultyRaw = typeof raw.difficulty === "string" ? raw.difficulty : Array.isArray(raw.difficulty) ? raw.difficulty[0] : undefined;
  const difficulty = difficultyRaw?.toLowerCase() || undefined;
  const country = typeof raw.country === "string" ? raw.country : Array.isArray(raw.country) ? raw.country[0] : undefined;

  let templates: { id: string; name: string | null; category: string | null; difficulty: string | null; target_country: string | null; language: string | null }[] = [];
  let categoryList: string[] = [];
  try {
    let query = supabase
      .from("phishing_templates")
      .select("id, name, category, difficulty, target_country, language")
      .eq("is_published", true);
    if (category) query = query.eq("category", category);
    if (difficulty) query = query.eq("difficulty", difficulty);
    if (country) query = query.eq("target_country", country);
    const res = await query.order("name");
    templates = res.data ?? [];
    const catRes = await supabase.from("phishing_templates").select("category").eq("is_published", true);
    categoryList = [...new Set((catRes.data ?? []).map((c) => c.category).filter(Boolean))] as string[];
  } catch {
    templates = [];
    categoryList = [];
  }

  return (
    <div className="space-y-8">
      <header className="mb-6">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Simulations
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">Phishing Templates</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Browse and preview templates for your campaigns
        </p>
      </header>

      <TemplatesFilterBar
        categoryList={categoryList}
        currentCategory={category}
        currentDifficulty={difficulty}
        currentCountry={country}
      />

      {!templates?.length ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <Mail className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-3 text-sm font-medium text-neutral-950">
            Templates are managed by namethreat.
          </p>
          <p className="mt-1 text-sm text-neutral-500">Check back soon.</p>
        </div>
      ) : (
        <TemplatesGrid templates={templates} />
      )}
    </div>
  );
}
