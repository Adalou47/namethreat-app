import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";
import { ResultsTable } from "./results-table";

export default async function PhishingResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign_id?: string }>;
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
  const campaignIdFilter = params.campaign_id ?? null;

  const { data: campaigns } = await supabase
    .from("phishing_campaigns")
    .select("id, name")
    .eq("organisation_id", dbUser.organisation_id)
    .order("created_at", { ascending: false });

  const campaignIds = (campaigns ?? []).map((c) => c.id);
  const campaignMap = (campaigns ?? []).reduce(
    (acc, c) => {
      acc[c.id] = c.name ?? "—";
      return acc;
    },
    {} as Record<string, string>
  );

  let deliveries: { id: string; campaign_id: string | null; user_id: string | null; sent_at: string | null; opened_at: string | null; clicked_at: string | null; outcome: string | null }[] = [];
  if (campaignIds.length > 0) {
    let query = supabase
      .from("campaign_deliveries")
      .select("id, campaign_id, user_id, sent_at, opened_at, clicked_at, outcome")
      .in("campaign_id", campaignIds)
      .order("sent_at", { ascending: false });
    if (campaignIdFilter) query = query.eq("campaign_id", campaignIdFilter);
    const { data } = await query;
    deliveries = data ?? [];
  }

  const userIds = [...new Set(deliveries.map((d) => d.user_id).filter(Boolean))] as string[];
  let userMap: Record<string, { full_name: string | null; email: string | null }> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", userIds);
    userMap = (users ?? []).reduce(
      (acc, u) => {
        acc[u.id] = { full_name: u.full_name ?? null, email: u.email ?? null };
        return acc;
      },
      {} as Record<string, { full_name: string | null; email: string | null }>
    );
  }

  const rows = deliveries.map((d) => {
    const u = d.user_id ? userMap[d.user_id] : null;
    return {
      id: d.id,
      employee: u?.full_name ?? "—",
      email: u?.email ?? "—",
      campaign: d.campaign_id ? campaignMap[d.campaign_id] ?? "—" : "—",
      sent: d.sent_at ? new Date(d.sent_at).toLocaleString() : "—",
      opened: d.opened_at ? "Yes" : "No",
      clicked: d.clicked_at ? "Yes" : "No",
      outcome: d.outcome ?? "—",
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Phishing Results</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          View results across all campaigns
        </p>
      </header>

      <ResultsTable
        campaigns={campaigns ?? []}
        currentCampaignId={campaignIdFilter}
        rows={rows}
      />
    </div>
  );
}
