import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Building2, Plus, UserPlus, FileSpreadsheet, Mail } from "lucide-react";

export default async function ClientsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!dbUser || dbUser.role !== "msp_admin" || !dbUser.msp_id) {
    redirect("/dashboard");
  }

  const { data: orgs } = await supabase
    .from("organisations")
    .select("id, name")
    .eq("msp_id", dbUser.msp_id);

  const clientOrgs = orgs ?? [];
  const orgIds = clientOrgs.map((o) => o.id);

  let employeeCountByOrg: Record<string, number> = {};
  let campaignCountByOrg: Record<string, number> = {};
  if (orgIds.length > 0) {
    const [empRes, campRes] = await Promise.all([
      supabase
        .from("users")
        .select("organisation_id")
        .in("organisation_id", orgIds)
        .eq("role", "employee"),
      supabase
        .from("phishing_campaigns")
        .select("organisation_id")
        .in("organisation_id", orgIds)
        .eq("status", "active"),
    ]);
    (empRes.data ?? []).forEach((r) => {
      const id = r.organisation_id ?? "";
      employeeCountByOrg[id] = (employeeCountByOrg[id] ?? 0) + 1;
    });
    (campRes.data ?? []).forEach((r) => {
      const id = r.organisation_id ?? "";
      campaignCountByOrg[id] = (campaignCountByOrg[id] ?? 0) + 1;
    });
  }

  const rows = clientOrgs.map((org) => ({
    id: org.id,
    name: org.name ?? "—",
    employees: employeeCountByOrg[org.id] ?? 0,
    activeCampaigns: campaignCountByOrg[org.id] ?? 0,
    avgRiskScore: 0,
    status: "Active",
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-[#000000]">Your Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-12 text-center">
          <Building2 className="mx-auto mb-4 h-14 w-14 text-[#6b6b6b]" />
          <h2 className="text-lg font-semibold text-[#000000]">No clients yet</h2>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            Add your first client to get started
          </p>
          <Link
            href="/dashboard/clients/new"
            className="mt-6 inline-block rounded-[4px] bg-[#000000] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
          >
            Add Client
          </Link>
          <div className="mx-auto mt-10 max-w-md space-y-4 rounded-[6px] border border-[#e5e5e5] bg-white p-6 text-left">
            <p className="text-sm font-medium text-[#000000]">
              How easy it is to get started:
            </p>
            <ol className="space-y-3 text-sm text-[#6b6b6b]">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5] text-xs font-medium text-[#000000]">
                  1
                </span>
                Add client details (company name, domain, country, industry)
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5] text-xs font-medium text-[#000000]">
                  2
                </span>
                Connect Microsoft Entra or import CSV to add employees
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5] text-xs font-medium text-[#000000]">
                  3
                </span>
                Launch your first phishing campaign for the client
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[6px] border border-[#e5e5e5] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                  Organisation Name
                </th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                  Employees
                </th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                  Active Campaigns
                </th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                  Avg Risk Score
                </th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                  Status
                </th>
                <th className="pb-3 font-medium text-[#6b6b6b]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#e5e5e5] last:border-0 hover:bg-[#fafafa]"
                >
                  <td className="py-3 pr-4 font-medium text-[#000000]">
                    <Link href={`/dashboard/clients/${row.id}`} className="block">
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-[#000000]">{row.employees}</td>
                  <td className="py-3 pr-4 text-[#000000]">
                    {row.activeCampaigns}
                  </td>
                  <td className="py-3 pr-4 text-[#000000]">{row.avgRiskScore}</td>
                  <td className="py-3 pr-4 text-[#000000]">{row.status}</td>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/clients/${row.id}`}
                      className="text-[#000000] underline hover:no-underline"
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
