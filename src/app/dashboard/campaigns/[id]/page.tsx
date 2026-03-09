import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { CampaignDetailClient } from "./campaign-detail-client";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#e5e5e5] text-[#6b6b6b]",
  scheduled: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-[#000000] text-white",
  cancelled: "bg-red-100 text-red-800",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;
  let campaign: { id: string; organisation_id: string | null; [key: string]: unknown } | null = null;
  if (dbUser.msp_id) {
    const { data: clientOrgs } = await supabase
      .from("organisations")
      .select("id")
      .eq("msp_id", dbUser.msp_id);
    const orgIds = (clientOrgs ?? []).map((o) => o.id);
    if (orgIds.length > 0) {
      const res = await supabase
        .from("phishing_campaigns")
        .select("*")
        .eq("id", id)
        .in("organisation_id", orgIds)
        .maybeSingle();
      campaign = res.data;
    }
  } else if (dbUser.organisation_id) {
    const res = await supabase
      .from("phishing_campaigns")
      .select("*")
      .eq("id", id)
      .eq("organisation_id", dbUser.organisation_id)
      .maybeSingle();
    campaign = res.data;
  }

  if (!campaign) notFound();

  let rows: { id: string; userName: string; email: string; sentAt: string | null; openedAt: string | null; clickedAt: string | null; credentialsSubmitted: boolean | null; reportedAt: string | null; outcome: string | null }[] = [];
  try {
    const { data: deliveries } = await supabase
      .from("campaign_deliveries")
      .select("id, user_id, sent_at, opened_at, clicked_at, credentials_submitted, reported_at, outcome")
      .eq("campaign_id", id)
      .order("sent_at", { ascending: false });

    const userIds = [...new Set((deliveries ?? []).map((d) => d.user_id).filter(Boolean))] as string[];
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
    rows = (deliveries ?? []).map((d) => {
      const u = d.user_id ? userMap[d.user_id] : null;
      return {
        id: d.id,
        userName: u?.full_name ?? "—",
        email: u?.email ?? "—",
        sentAt: d.sent_at,
        openedAt: d.opened_at,
        clickedAt: d.clicked_at,
        credentialsSubmitted: d.credentials_submitted,
        reportedAt: d.reported_at,
        outcome: d.outcome,
      };
    });
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#000000]">{campaign.name ?? "Campaign"}</h1>
          <span
            className={`mt-2 inline-block rounded-[4px] px-2 py-1 text-xs font-medium ${STATUS_STYLES[campaign.status ?? ""] ?? "bg-[#e5e5e5] text-[#6b6b6b]"}`}
          >
            {campaign.status ?? "—"}
          </span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
            Total Targets
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#000000]">
            {campaign.total_targets ?? 0}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
            Emails Sent
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#000000]">
            {campaign.total_sent ?? 0}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
            Clicked
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#000000]">
            {campaign.total_clicked ?? 0}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
            Reported
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#000000]">
            {campaign.total_reported ?? 0}
          </p>
        </div>
      </section>

      <section className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
        <p className="text-sm text-[#6b6b6b]">
          Click rate: <span className="font-medium text-[#000000]">{campaign.click_rate ?? 0}%</span>
          {" · "}
          Report rate: <span className="font-medium text-[#000000]">{campaign.report_rate ?? 0}%</span>
        </p>
      </section>

      <CampaignDetailClient campaignId={id} rows={rows} />
    </div>
  );
}
