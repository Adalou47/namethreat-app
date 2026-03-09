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
    .select("organisation_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser?.organisation_id) redirect("/onboarding/msp");

  const params = await searchParams;
  let templates: { id: string; name: string | null; category: string | null; difficulty: string | null; target_country: string | null; language: string | null }[] = [];
  let categoryList: string[] = [];
  try {
    let query = supabase
      .from("phishing_templates")
      .select("id, name, category, difficulty, target_country, language")
      .eq("is_published", true);
    if (params.category) query = query.eq("category", params.category);
    if (params.difficulty) query = query.eq("difficulty", params.difficulty);
    if (params.country) query = query.eq("target_country", params.country);
    const res = await query.order("name");
    templates = res.data ?? [];
    const catRes = await supabase.from("phishing_templates").select("category").eq("is_published", true);
    categoryList = [...new Set((catRes.data ?? []).map((c) => c.category).filter(Boolean))] as string[];
  } catch {
    templates = [];
    categoryList = [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Phishing Templates</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Browse and preview templates for your campaigns
        </p>
      </header>

      <TemplatesFilterBar
        categoryList={categoryList}
        currentCategory={params.category}
        currentDifficulty={params.difficulty}
        currentCountry={params.country}
      />

      {!templates?.length ? (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-12 text-center">
          <Mail className="mx-auto mb-3 h-12 w-12 text-[#6b6b6b]" />
          <p className="text-sm font-medium text-[#000000]">
            Templates are managed by namethreat.
          </p>
          <p className="mt-1 text-sm text-[#6b6b6b]">Check back soon.</p>
        </div>
      ) : (
        <TemplatesGrid templates={templates} />
      )}
    </div>
  );
}
