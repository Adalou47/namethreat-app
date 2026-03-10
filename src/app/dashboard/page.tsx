import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
// Service role client to bypass RLS for server-side dashboard data
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  Users,
  Mail,
  Shield,
  CheckCircle,
  Building2,
} from "lucide-react";

type ClientOrgItem = {
  id: string;
  name: string | null;
  employeeCount: number;
};

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("*, organisations(*)")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!user) {
    redirect("/onboarding/company");
  }

  const userRole = user.role ?? "";
  const roleLabel = String(userRole).replace(/_/g, " ");
  const isMspAdmin = userRole === "msp_admin";

  // —— msp_admin: all organisations where msp_id = user.msp_id, aggregated counts ——
  if (isMspAdmin) {
    const mspId = user.msp_id;
    let mspName = "";
    if (mspId) {
      const { data: msp } = await supabase
        .from("msps")
        .select("name")
        .eq("id", mspId)
        .single();
      mspName = msp?.name ?? "";
    }

    if (!mspId) {
      return (
        <DashboardMspView
          mspName={mspName}
          totalClients={0}
          totalEmployees={0}
          totalActiveCampaigns={0}
          clientOrgs={[]}
          recentCampaigns={[]}
        />
      );
    }

    const { data: clientOrgs } = await supabase
      .from("organisations")
      .select("id, name")
      .eq("msp_id", mspId);

    const orgIds = (clientOrgs ?? []).map((o) => o.id);
    if (orgIds.length === 0) {
      return (
        <DashboardMspView
          mspName={mspName}
          totalClients={0}
          totalEmployees={0}
          totalActiveCampaigns={0}
          clientOrgs={[]}
          recentCampaigns={[]}
        />
      );
    }

    const [
      { data: allEmployees },
      { count: totalActiveCampaigns },
      { data: recentCampaigns },
    ] = await Promise.all([
      supabase
        .from("users")
        .select("organisation_id")
        .in("organisation_id", orgIds)
        .eq("role", "employee"),
      supabase
        .from("phishing_campaigns")
        .select("*", { count: "exact", head: true })
        .in("organisation_id", orgIds)
        .eq("status", "active"),
      supabase
        .from("phishing_campaigns")
        .select("id, name, status, organisation_id, created_at")
        .in("organisation_id", orgIds)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const totalEmployees = (allEmployees ?? []).length;
    const totalClients = orgIds.length;
    const employeesByOrg = (allEmployees ?? []).reduce<Record<string, number>>(
      (acc, u) => {
        const id = u.organisation_id ?? "";
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      },
      {}
    );
    const clientOrgsList: ClientOrgItem[] = (clientOrgs ?? []).map((org) => ({
      id: org.id,
      name: org.name,
      employeeCount: employeesByOrg[org.id] ?? 0,
    }));

    return (
      <DashboardMspView
        mspName={mspName}
        totalClients={totalClients}
        totalEmployees={totalEmployees}
        totalActiveCampaigns={totalActiveCampaigns ?? 0}
        clientOrgs={clientOrgsList}
        recentCampaigns={recentCampaigns ?? []}
      />
    );
  }

  // —— org_admin: own organisation only ——
  const organisationId = user.organisation_id;
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

type RecentCampaignItem = {
  id: string;
  name: string | null;
  status: string | null;
  organisation_id: string | null;
  created_at: string | null;
};

// MSP dashboard: welcome + stats + client list + recent activity
function DashboardMspView({
  mspName,
  totalClients,
  totalEmployees,
  totalActiveCampaigns,
  clientOrgs,
  recentCampaigns,
}: {
  mspName: string;
  totalClients: number;
  totalEmployees: number;
  totalActiveCampaigns: number;
  clientOrgs: ClientOrgItem[];
  recentCampaigns: RecentCampaignItem[];
}) {
  return (
    <div className="space-y-8">
      <header className="mb-6">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Overview
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">
          Welcome back{mspName ? `, ${mspName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Your MSP dashboard and client overview
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Building2 className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Total Clients
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            {totalClients}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Users className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Total Employees
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            {totalEmployees}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Mail className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Active Campaigns
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            {totalActiveCampaigns}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Shield className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Avg Risk Score
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            —
          </p>
        </div>
      </section>

      {clientOrgs.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm transition-shadow duration-200 hover:shadow-md">
          <Building2 className="mx-auto h-8 w-8 text-neutral-300" />
          <h2 className="mt-3 text-sm font-medium text-neutral-950">Add your first client</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Add your first client to get started
          </p>
          <Link
            href="/dashboard/clients/new"
            className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
          >
            Add Client
          </Link>
          <div className="mx-auto mt-10 max-w-md space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-left">
            <p className="text-sm font-medium text-neutral-950">
              How easy it is to get started:
            </p>
            <ol className="space-y-3 text-sm text-neutral-500">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-950">
                  1
                </span>
                Add client details (company name, domain, country, industry)
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-950">
                  2
                </span>
                Connect Microsoft Entra or import CSV to add employees
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-950">
                  3
                </span>
                Launch your first phishing campaign for the client
              </li>
            </ol>
          </div>
        </div>
      )}

      {clientOrgs.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Client Organisations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Organisation</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Employees</th>
                </tr>
              </thead>
              <tbody>
                {clientOrgs.map(({ id, name, employeeCount }) => (
                  <tr key={id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-950">
                      <Link href={`/dashboard/clients/${id}`} className="hover:underline">
                        {name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-950">{employeeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recentCampaigns.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Recent activity
          </p>
          <ul className="space-y-2">
            {recentCampaigns.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/dashboard/campaigns/${c.id}`}
                  className="font-medium text-neutral-950 hover:underline"
                >
                  {c.name ?? "Unnamed campaign"}
                </Link>
                <span className="text-neutral-500">
                  {c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {clientOrgs.length > 0 && (
        <section>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Quick Actions
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-base font-semibold text-neutral-950">
                Add Client
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Onboard a new client organisation
              </p>
              <Link
                href="/dashboard/clients/new"
                className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
              >
                Get Started
              </Link>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-base font-semibold text-neutral-950">
                Launch Campaign
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Send a phishing simulation to a client
              </p>
              <Link
                href="/dashboard/campaigns"
                className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
              >
                Get Started
              </Link>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-base font-semibold text-neutral-950">
                View Reports
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Download security reports for compliance
              </p>
              <Link
                href="/dashboard/reports"
                className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Direct company dashboard: single org stats
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
    <div className="space-y-8">
      <header className="mb-6">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Overview
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Signed in as <span className="font-medium capitalize text-neutral-950">{roleLabel}</span>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Users className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Total Employees
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            {totalEmployees}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Mail className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Active Campaigns
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            {activeCampaigns}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Shield className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Avg Risk Score
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            0/100
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <CheckCircle className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Training Completion
          </p>
          <p className="mt-1 text-[32px] font-bold text-neutral-950">
            0%
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Recent Campaigns
          </p>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-8 w-8 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-neutral-950">No campaigns yet</p>
            <Link
              href="/dashboard/campaigns"
              className="mt-4 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
            >
              Create Campaign
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Risk Overview
          </p>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-8 w-8 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-neutral-950">No data yet</p>
            <p className="mt-1 text-sm text-neutral-500">
              Import employees to see risk scores
            </p>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Quick Actions
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="text-base font-semibold text-neutral-950">
              Import Employees
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Add your team via CSV or Microsoft Entra
            </p>
            <Link
              href="/dashboard/employees"
              className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="text-base font-semibold text-neutral-950">
              Launch Campaign
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Send a phishing simulation to your team
            </p>
            <Link
              href="/dashboard/campaigns"
              className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="text-base font-semibold text-neutral-950">
              View Reports
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Download security reports for compliance
            </p>
            <Link
              href="/dashboard/reports"
              className="mt-4 inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
