import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Mail, Plus } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#e5e5e5] text-[#6b6b6b]",
  scheduled: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-[#000000] text-white",
  cancelled: "bg-red-100 text-red-800",
};

export default async function CampaignsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("organisation_id, role, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser?.organisation_id) redirect("/onboarding/msp");

  const isMspAdmin = dbUser.role === "msp_admin" && dbUser.msp_id;
  let orgIds: string[] = [dbUser.organisation_id];

  if (dbUser.msp_id) {
    const { data: clientOrgs } = await supabase
      .from("organisations")
      .select("id")
      .eq("msp_id", dbUser.msp_id);
    orgIds = (clientOrgs ?? []).map((o) => o.id);
  }

  const { data: campaigns } = await supabase
    .from("phishing_campaigns")
    .select("id, name, status, total_targets, total_sent, total_clicked, click_rate, created_at, organisation_id")
    .in("organisation_id", orgIds)
    .order("created_at", { ascending: false });

  let orgNames: Record<string, string> = {};
  if (isMspAdmin && campaigns?.length) {
    const ids = [...new Set((campaigns ?? []).map((c) => c.organisation_id).filter(Boolean))];
    const { data: orgs } = await supabase
      .from("organisations")
      .select("id, name")
      .in("id", ids);
    orgNames = (orgs ?? []).reduce<Record<string, string>>((acc, o) => {
      acc[o.id] = o.name ?? "—";
      return acc;
    }, {});
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#000000]">Phishing Campaigns</h1>
          <p className="mt-1 text-sm text-[#6b6b6b]">
            Create and manage phishing simulations
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center gap-2 rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </Link>
      </header>

      {!campaigns?.length ? (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-12 text-center">
          <Mail className="mx-auto mb-3 h-12 w-12 text-[#6b6b6b]" />
          <p className="text-sm font-medium text-[#000000]">No campaigns yet.</p>
          <p className="mt-1 text-sm text-[#6b6b6b]">
            Create your first phishing simulation.
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Name</th>
                {isMspAdmin && (
                  <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Client</th>
                )}
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Status</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Targets</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Sent</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Clicked</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Click Rate</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Created</th>
                <th className="pb-3 font-medium text-[#6b6b6b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[#e5e5e5] last:border-0 hover:bg-white/50"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/dashboard/campaigns/${c.id}`}
                      className="font-medium text-[#000000] hover:underline"
                    >
                      {c.name ?? "Unnamed"}
                    </Link>
                  </td>
                  {isMspAdmin && (
                    <td className="py-3 pr-4 text-[#6b6b6b]">
                      <Link
                        href={`/dashboard/clients/${c.organisation_id}`}
                        className="hover:underline"
                      >
                        {orgNames[c.organisation_id ?? ""] ?? "—"}
                      </Link>
                    </td>
                  )}
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-[4px] px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status ?? ""] ?? "bg-[#e5e5e5] text-[#6b6b6b]"}`}
                    >
                      {c.status ?? "—"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#000000]">{c.total_targets ?? 0}</td>
                  <td className="py-3 pr-4 text-[#000000]">{c.total_sent ?? 0}</td>
                  <td className="py-3 pr-4 text-[#000000]">{c.total_clicked ?? 0}</td>
                  <td className="py-3 pr-4 text-[#000000]">
                    {c.click_rate != null ? `${c.click_rate}%` : "—"}
                  </td>
                  <td className="py-3 pr-4 text-[#6b6b6b]">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/campaigns/${c.id}`}
                      className="text-sm font-medium text-[#000000] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
