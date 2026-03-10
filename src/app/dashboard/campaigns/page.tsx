import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Mail, Plus } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  scheduled: "bg-neutral-100 text-neutral-500",
  active: "bg-green-50 text-green-600",
  completed: "bg-neutral-950 text-white",
  cancelled: "bg-red-50 text-red-500",
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
  if (!dbUser) redirect("/onboarding/msp");
  const hasOrg = dbUser.organisation_id != null;
  const hasMsp = dbUser.msp_id != null;
  if (!hasOrg && !hasMsp) redirect("/onboarding/msp");

  const isMspAdmin = dbUser.role === "msp_admin" && dbUser.msp_id;
  let orgIds: string[];
  if (dbUser.msp_id) {
    const { data: clientOrgs } = await supabase
      .from("organisations")
      .select("id")
      .eq("msp_id", dbUser.msp_id);
    orgIds = (clientOrgs ?? []).map((o) => o.id);
  } else {
    orgIds = [dbUser.organisation_id as string];
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
      .in("id", ids.filter((id): id is string => id !== null));
    orgNames = (orgs ?? []).reduce<Record<string, string>>((acc, o) => {
      acc[o.id] = o.name ?? "—";
      return acc;
    }, {});
  }

  return (
    <div className="space-y-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Simulations
          </p>
          <h1 className="text-2xl font-bold text-neutral-950">Phishing Campaigns</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Create and manage phishing simulations
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </Link>
      </header>

      {!campaigns?.length ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <Mail className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-3 text-sm font-medium text-neutral-950">No campaigns yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Create your first phishing simulation.
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Name</th>
                  {isMspAdmin && (
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Client</th>
                  )}
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Targets</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Sent</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Clicked</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Click Rate</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Created</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/campaigns/${c.id}`}
                        className="font-medium text-neutral-950 hover:underline"
                      >
                        {c.name ?? "Unnamed"}
                      </Link>
                    </td>
                    {isMspAdmin && (
                      <td className="px-4 py-3 text-neutral-500">
                        <Link
                          href={`/dashboard/clients/${c.organisation_id}`}
                          className="hover:underline"
                        >
                          {orgNames[c.organisation_id ?? ""] ?? "—"}
                        </Link>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[c.status ?? ""] ?? "bg-neutral-100 text-neutral-500"}`}
                      >
                        {c.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-950">{c.total_targets ?? 0}</td>
                    <td className="px-4 py-3 text-neutral-950">{c.total_sent ?? 0}</td>
                    <td className="px-4 py-3 text-neutral-950">{c.total_clicked ?? 0}</td>
                    <td className="px-4 py-3 text-neutral-950">
                      {c.click_rate != null ? `${c.click_rate}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/campaigns/${c.id}`}
                        className="text-sm font-medium text-neutral-950 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
