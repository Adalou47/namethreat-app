import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  Users,
  Mail,
  Shield,
  CheckCircle,
  Plus,
  BarChart3,
  LayoutGrid,
} from "lucide-react";
import { EntraSyncButton } from "@/components/entra-sync-button";
import { CsvImportSection } from "@/components/csv-import-section";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#e5e5e5] text-[#6b6b6b]",
  scheduled: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-[#000000] text-white",
  cancelled: "bg-red-100 text-red-800",
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "employees", label: "Employees", icon: Users },
  { id: "campaigns", label: "Campaigns", icon: Mail },
  { id: "reports", label: "Reports", icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: orgId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: TabId =
    TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "overview";

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

  const { data: org } = await supabase
    .from("organisations")
    .select("id, name, domain, country, industry, size_band")
    .eq("id", orgId)
    .eq("msp_id", dbUser.msp_id)
    .single();

  if (!org) notFound();

  const [
    { count: employeeCount },
    { data: campaigns },
    { data: integration },
    { data: employees },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("role", "employee"),
    supabase
      .from("phishing_campaigns")
      .select("id, name, status, total_targets, total_sent, total_clicked, click_rate, created_at")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("integrations")
      .select("id, last_used_at")
      .eq("organisation_id", orgId)
      .eq("integration_type", "microsoft_entra")
      .eq("status", "connected")
      .maybeSingle(),
    tab === "employees"
      ? supabase
          .from("users")
          .select("id, full_name, email, department, job_title, risk_score, is_active")
          .eq("organisation_id", orgId)
          .eq("role", "employee")
          .order("full_name")
      : { data: null },
  ]);

  const totalEmployees = employeeCount ?? 0;
  const activeCampaigns = (campaigns ?? []).filter((c) => c.status === "active").length;
  const avgRiskScore = 0;
  const trainingCompletion = 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-[#000000]">
            {org.name ?? "Client"}
          </h1>
          <span className="rounded-[4px] border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-1 text-xs font-medium text-[#6b6b6b]">
            Active
          </span>
        </div>
        <Link
          href={`/dashboard/campaigns/new?organisation_id=${orgId}`}
          className="inline-flex items-center gap-2 rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
        >
          <Plus className="h-4 w-4" />
          Launch Campaign
        </Link>
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
            {avgRiskScore}
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
            {trainingCompletion}%
          </p>
        </div>
      </section>

      <nav className="flex gap-1 border-b border-[#e5e5e5]">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={`/dashboard/clients/${orgId}?tab=${t.id}`}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#000000] text-[#000000]"
                  : "border-transparent text-[#6b6b6b] hover:text-[#000000]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      {tab === "overview" && (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
            Client details
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-[#6b6b6b]">
                Company name
              </dt>
              <dd className="mt-0.5 text-[#000000]">{org.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-[#6b6b6b]">
                Domain
              </dt>
              <dd className="mt-0.5 text-[#000000]">{org.domain ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-[#6b6b6b]">
                Country
              </dt>
              <dd className="mt-0.5 text-[#000000]">{org.country ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-[#6b6b6b]">
                Industry
              </dt>
              <dd className="mt-0.5 text-[#000000]">{org.industry ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-[#6b6b6b]">
                Size band
              </dt>
              <dd className="mt-0.5 text-[#000000]">{org.size_band ?? "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      {tab === "employees" && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
              Import employees
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#00a4ef] text-white">
                    <Shield className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-[#000000]">
                    Microsoft Entra / Azure AD
                  </span>
                </div>
                <p className="mb-4 text-sm text-[#6b6b6b]">
                  Sync employees automatically from Microsoft 365
                </p>
                <Link
                  href={`/api/integrations/entra/connect?organisation_id=${encodeURIComponent(orgId)}`}
                  className="inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
                >
                  Connect Microsoft Entra
                </Link>
              </div>
              <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
                <span className="font-medium text-[#000000]">Import CSV</span>
                <p className="mt-2 text-sm text-[#6b6b6b]">
                  Upload a CSV to add employees in bulk
                </p>
                <div className="mt-4">
                  <CsvImportSection organisationId={orgId} />
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
                Employee list
              </h2>
              {integration && (
                <EntraSyncButton organisationId={orgId} />
              )}
            </div>
            {!employees?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-[#6b6b6b]" />
                <p className="text-sm font-medium text-[#000000]">
                  No employees yet
                </p>
                <p className="mt-1 text-sm text-[#6b6b6b]">
                  Connect Entra or import CSV to add employees
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                        Name
                      </th>
                      <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                        Email
                      </th>
                      <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                        Department
                      </th>
                      <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                        Job Title
                      </th>
                      <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                        Risk Score
                      </th>
                      <th className="pb-3 font-medium text-[#6b6b6b]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-b border-[#e5e5e5] last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-[#000000]">
                          {emp.full_name ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-[#000000]">
                          {emp.email ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-[#000000]">
                          {emp.department ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-[#000000]">
                          {emp.job_title ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-[#000000]">
                          {emp.risk_score != null ? emp.risk_score : "—"}
                        </td>
                        <td className="py-3 text-[#6b6b6b]">
                          {emp.is_active ? "Active" : "Inactive"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
              Campaigns
            </h2>
            <Link
              href={`/dashboard/campaigns/new?organisation_id=${orgId}`}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[#000000] px-3 py-2 text-sm font-medium text-white hover:bg-[#111111]"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </Link>
          </div>
          {!campaigns?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="mx-auto mb-3 h-12 w-12 text-[#6b6b6b]" />
              <p className="text-sm font-medium text-[#000000]">
                No campaigns for this client yet
              </p>
              <Link
                href={`/dashboard/campaigns/new?organisation_id=${orgId}`}
                className="mt-4 inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
              >
                Launch Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                      Name
                    </th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                      Status
                    </th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                      Targets
                    </th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                      Sent
                    </th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                      Clicked
                    </th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">
                      Click Rate
                    </th>
                    <th className="pb-3 font-medium text-[#6b6b6b]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[#e5e5e5] last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-[#000000]">
                        <Link
                          href={`/dashboard/campaigns/${c.id}`}
                          className="hover:underline"
                        >
                          {c.name ?? "Unnamed"}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-[4px] px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status ?? ""] ?? "bg-[#e5e5e5] text-[#6b6b6b]"}`}
                        >
                          {c.status ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[#000000]">
                        {c.total_targets ?? 0}
                      </td>
                      <td className="py-3 pr-4 text-[#000000]">
                        {c.total_sent ?? 0}
                      </td>
                      <td className="py-3 pr-4 text-[#000000]">
                        {c.total_clicked ?? 0}
                      </td>
                      <td className="py-3 pr-4 text-[#000000]">
                        {c.click_rate != null ? `${c.click_rate}%` : "—"}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/dashboard/campaigns/${c.id}`}
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
      )}

      {tab === "reports" && (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-[#6b6b6b]" />
          <p className="text-sm font-medium text-[#000000]">Reports for this client</p>
          <p className="mt-1 text-sm text-[#6b6b6b]">
            Generate and download security reports (coming soon)
          </p>
        </div>
      )}
    </div>
  );
}
