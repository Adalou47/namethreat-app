import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { CampaignWizard } from "./campaign-wizard";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ template_id?: string; organisation_id?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("organisation_id, role, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  const hasOrg = dbUser.organisation_id != null;
  const hasMsp = dbUser.msp_id != null;
  if (!hasOrg && !hasMsp) redirect("/onboarding/msp");

  const params = await searchParams;
  const preselectedTemplateId = params.template_id ?? null;
  const paramOrgId = params.organisation_id ?? null;

  let organisationId: string | null = dbUser.organisation_id;
  if (paramOrgId && dbUser.role === "msp_admin" && dbUser.msp_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .eq("id", paramOrgId)
      .eq("msp_id", dbUser.msp_id)
      .single();
    if (org) organisationId = org.id;
  }

  if (!organisationId) {
    if (dbUser.role === "msp_admin") redirect("/dashboard/clients");
    redirect("/onboarding/msp");
  }

  let templates: { id: string; name: string | null; category: string | null; difficulty: string | null; target_country: string | null; language: string | null }[] = [];
  let sendingDomains: { id: string; domain: string | null; reputation_score: number | null }[] = [];
  let departments: string[] = [];
  try {
    const [tRes, sRes, dRes] = await Promise.all([
      supabase
        .from("phishing_templates")
        .select("id, name, category, difficulty, target_country, language")
        .eq("is_published", true)
        .order("name"),
      supabase
        .from("sending_domains")
        .select("id, domain, reputation_score")
        .eq("status", "active"),
      supabase
        .from("users")
        .select("department")
        .eq("organisation_id", organisationId)
        .eq("role", "employee")
        .not("department", "is", null),
    ]);
    templates = tRes.data ?? [];
    sendingDomains = sRes.data ?? [];
    departments = [...new Set((dRes.data ?? []).map((d) => d.department).filter(Boolean))] as string[];
  } catch {
    templates = [];
    sendingDomains = [];
    departments = [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Create Campaign</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Set up a new phishing simulation in three steps
        </p>
      </header>
      <CampaignWizard
        organisationId={organisationId as string}
        userId={userId}
        templates={templates ?? []}
        sendingDomains={sendingDomains ?? []}
        departments={departments}
        preselectedTemplateId={preselectedTemplateId}
      />
    </div>
  );
}
