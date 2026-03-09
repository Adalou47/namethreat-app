import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  Users,
  Mail,
  Shield,
  CheckCircle,
  Building2,
} from "lucide-react";
type ClientOrgWithStats = {
  org: { id: string; name: string | null; onboarding_complete: boolean | null };
  employeeCount: number;
  activeCampaigns: number;
  avgRiskScore: number | null;
  status: string;
};

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseServiceClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*, organisations(*)")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (userError || !user) {
    redirect("/onboarding/company");
  }

  const userRole = user.role ?? "";
  const roleLabel = String(userRole).replace(/_/g, " ");
  const isMspAdmin = userRole === "msp_admin";
  const isOrgUser = userRole === "org_admin" || userRole === "org_viewer";

  // —— MSP admin: aggregated data across all client organisations ——
  if (isMspAdmin) {
    const mspId = user.msp_id;
    if (!mspId) {
      return (
        <DashboardMspView
          totalClients={0}
          totalEmployees={0}
          totalActiveCampaigns={0}
          clientOrgs={[]}
          roleLabel={roleLabel}
        />
      );
    }

    const { data: clientOrgs } = await supabase
      .from("organisations")
      .select("id, name, onboarding_complete")
      .eq("msp_id", mspId);

    const orgIds = (clientOrgs ?? []).map((o) => o.id);
    if (orgIds.length === 0) {
      return (
        <DashboardMspView
          totalClients={0}
          totalEmployees={0}
          totalActiveCampaigns={0}
          clientOrgs={[]}
          roleLabel={roleLabel}
        />
      );
    }

    const [
      { data: allEmployees },
      { data: activeCampaigns },
    ] = await Promise.all([
      supabase
        .from("users")
        .select("organisation_id, risk_score")
        .in("organisation_id", orgIds)
        .eq("role", "employee"),
      supabase
        .from("phishing_campaigns")
        .select("organisation_id")
        .in("organisation_id", orgIds)
        .eq("status", "active"),
    ]);

    const totalEmployees = (allEmployees ?? []).length;
    const totalActiveCampaigns = (activeCampaigns ?? []).length;
    const totalClients = orgIds.length;

    // Per-org stats for client list
    const employeesByOrg = (allEmployees ?? []).reduce(
      (acc, u) => {
        const id = u.organisation_id ?? "";
        if (!acc[id]) acc[id] = { count: 0, riskSum: 0, riskCount: 0 };
        acc[id].count += 1;
        if (u.risk_score != null) {
          acc[id].riskSum += u.risk_score;
          acc[id].riskCount += 1;
        }
        return acc;
      },
      {} as Record<string, { count: number; riskSum: number; riskCount: number }>
    );
    const campaignsByOrg = (activeCampaigns ?? []).reduce(
      (acc, c) => {
        const id = c.organisation_id ?? "";
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const clientOrgsWithStats: ClientOrgWithStats[] = (clientOrgs ?? []).map(
      (org) => {
        const emp = employeesByOrg[org.id] ?? { count: 0, riskSum: 0, riskCount: 0 };
        const avgRisk =
          emp.riskCount > 0
            ? Math.round(emp.riskSum / emp.riskCount)
            : null;
        return {
          org: { id: org.id, name: org.name, onboarding_complete: org.onboarding_complete },
          employeeCount: emp.count,
          activeCampaigns: campaignsByOrg[org.id] ?? 0,
          avgRiskScore: avgRisk,
          status: org.onboarding_complete ? "Active" : "Setup",
        };
      }
    );

    return (
      <DashboardMspView
        totalClients={totalClients}
        totalEmployees={totalEmployees}
        totalActiveCampaigns={totalActiveCampaigns}
        clientOrgs={clientOrgsWithStats}
        roleLabel={roleLabel}
      />
    );
  }

  // —— Org admin / org viewer: single organisation only ——
  const organisationId = user.organisation_id;
  if (!organisationId && isOrgUser) {
    redirect("/onboarding/company");
  }
  if (!organisationId) {
    redirect("/onboarding/company");
  }

  const [
    { count: employeeCount },
    { count: campaignCount },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", organisationId)
      .eq("role", "employee"),
    supabase
      .from("phishing_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", organisationId)
      .eq("status", "active"),
  ]);

  const totalEmployees = employeeCount ?? 0;
  const activeCampaigns = campaignCount ?? 0;

  return (
    <DashboardOrgView
      totalEmployees={totalEmployees}
      activeCampaigns={activeCampaigns}
      roleLabel={roleLabel}
    />
  );
}

// MSP dashboard: aggregated stats + client organisations list
function DashboardMspView({
  totalClients,
  totalEmployees,
  totalActiveCampaigns,
  clientOrgs,
  roleLabel,
}: {
  totalClients: number;
  totalEmployees: number;
  totalActiveCampaigns: number;
  clientOrgs: ClientOrgWithStats[];
  roleLabel: string;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-sm text-[#6b6b6b]">
          Signed in as{" "}
          <span className="font-medium capitalize text-[#000000]">
            {roleLabel}
          </span>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Total Clients
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            {totalClients}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Total Employees
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            {totalEmployees}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Active Campaigns
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            {totalActiveCampaigns}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Avg Risk Score
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            —
          </p>
        </div>
      </section>

      <section className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
          Client Organisations
        </h2>
        {clientOrgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-[#000000]">No client organisations yet</p>
            <p className="mt-1 text-sm text-[#6b6b6b]">
              Add clients to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Organisation</th>
                  <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Employees</th>
                  <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Active campaigns</th>
                  <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Avg risk</th>
                  <th className="pb-3 font-medium text-[#6b6b6b]">Status</th>
                </tr>
              </thead>
              <tbody>
                {clientOrgs.map(({ org, employeeCount, activeCampaigns, avgRiskScore, status }) => (
                  <tr key={org.id} className="border-b border-[#e5e5e5] last:border-0">
                    <td className="py-3 pr-4 font-medium text-[#000000]">
                      {org.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-[#000000]">{employeeCount}</td>
                    <td className="py-3 pr-4 text-[#000000]">{activeCampaigns}</td>
                    <td className="py-3 pr-4 text-[#000000]">
                      {avgRiskScore != null ? `${avgRiskScore}/100` : "—"}
                    </td>
                    <td className="py-3 text-[#6b6b6b]">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
            <h3 className="text-base font-semibold text-[#000000]">
              Add Client
            </h3>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Onboard a new client organisation
            </p>
            <Link
              href="/dashboard/employees"
              className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
            <h3 className="text-base font-semibold text-[#000000]">
              Launch Campaign
            </h3>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Send a phishing simulation to your team
            </p>
            <Link
              href="/dashboard/campaigns"
              className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
            <h3 className="text-base font-semibold text-[#000000]">
              View Reports
            </h3>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Download security reports for compliance
            </p>
            <Link
              href="/dashboard/reports"
              className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Direct company dashboard: single org stats (same 4 cards as before)
function DashboardOrgView({
  totalEmployees,
  activeCampaigns,
  roleLabel,
}: {
  totalEmployees: number;
  activeCampaigns: number;
  roleLabel: string;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-sm text-[#6b6b6b]">
          Signed in as{" "}
          <span className="font-medium capitalize text-[#000000]">{roleLabel}</span>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Total Employees
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            {totalEmployees}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Active Campaigns
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            {activeCampaigns}
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Avg Risk Score
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            0/100
          </p>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#6b6b6b]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
              Training Completion
            </span>
          </div>
          <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
            0%
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
            Recent Campaigns
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-[#000000]">No campaigns yet</p>
            <Link
              href="/dashboard/campaigns"
              className="mt-4 rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Create Campaign
            </Link>
          </div>
        </div>
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
            Risk Overview
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-[#000000]">No data yet</p>
            <p className="mt-1 text-sm text-[#6b6b6b]">
              Import employees to see risk scores
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
            <h3 className="text-base font-semibold text-[#000000]">
              Import Employees
            </h3>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Add your team via CSV or Microsoft Entra
            </p>
            <Link
              href="/dashboard/employees"
              className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
            <h3 className="text-base font-semibold text-[#000000]">
              Launch Campaign
            </h3>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Send a phishing simulation to your team
            </p>
            <Link
              href="/dashboard/campaigns"
              className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
            <h3 className="text-base font-semibold text-[#000000]">
              View Reports
            </h3>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Download security reports for compliance
            </p>
            <Link
              href="/dashboard/reports"
              className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
