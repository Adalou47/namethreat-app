import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { DashboardTopBar } from "@/components/dashboard-topbar";

const NAV_ITEMS = [
  "Overview",
  "Risk Score",
  "Phishing",
  "Training",
  "Domain Intelligence",
  "Settings",
] as const;

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseServiceClient();
  let { data: dbUser } = await supabase
    .from("users")
    .select("id, organisation_id, email, full_name, role")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!dbUser || !dbUser.organisation_id) {
    const clerkUser = await currentUser();
    const metadata = clerkUser?.publicMetadata as { onboarding_complete?: boolean; signup_type?: string } | undefined;
    if (metadata?.onboarding_complete === true) {
      await new Promise((r) => setTimeout(r, 300));
      const refetch = await supabase
        .from("users")
        .select("id, organisation_id, email, full_name, role")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      dbUser = refetch.data;
    }
    if (!dbUser || !dbUser.organisation_id) {
      const signupType = metadata?.signup_type;
      if (signupType === "company") {
        redirect("/onboarding/company");
      }
      redirect("/onboarding/msp");
    }
  }

  const orgId = dbUser.organisation_id;

  const [
    { data: organisation },
    { count: employeeCount },
    { count: activeCampaignsCount },
  ] = await Promise.all([
    supabase.from("organisations").select("name").eq("id", orgId).single(),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("role", "employee"),
    supabase
      .from("phishing_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("status", "active"),
  ]);

  const orgName = organisation?.name ?? "Organisation";
  const userRole = dbUser.role ?? "—";
  const userEmail = dbUser.email ?? "—";
  const totalEmployees = employeeCount ?? 0;
  const activeCampaigns = activeCampaignsCount ?? 0;

  return (
    <div className="flex min-h-screen bg-[#ffffff] text-[#000000]">
      <aside className="hidden w-60 flex-col border-r border-[#e5e5e5] bg-[#f5f5f5] px-6 py-8 sm:flex">
        <div className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b6b6b]">
          namethreat
        </div>
        <nav className="space-y-1 text-sm">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === 0;
            return (
              <button
                key={item}
                type="button"
                className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "bg-[#000000] text-white"
                    : "text-[#6b6b6b] hover:bg-[#e5e5e5] hover:text-[#000000]"
                }`}
              >
                <span>{item}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col bg-[#ffffff]">
        <DashboardTopBar />
        <main className="flex-1 bg-[#f5f5f5] px-4 py-6 sm:px-6">
          <header className="mb-6 border-b border-[#e5e5e5] bg-white px-4 py-4 sm:px-0">
            <h1 className="text-xl font-semibold text-[#000000]">{orgName}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b6b6b]">
              <span className="capitalize">{userRole.replace(/_/g, " ")}</span>
              <span>{userEmail}</span>
            </div>
          </header>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Total Employees
              </p>
              <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
                {totalEmployees}
              </p>
            </div>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Active Campaigns
              </p>
              <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
                {activeCampaigns}
              </p>
            </div>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Avg Risk Score
              </p>
              <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
                0
              </p>
            </div>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Training Completion
              </p>
              <p className="text-2xl font-semibold text-[#000000] sm:text-3xl">
                0%
              </p>
            </div>
          </section>

          <section className="mb-6 rounded-[6px] border border-[#e5e5e5] bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#6b6b6b]">
              Recent Activity
            </h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#6b6b6b]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </span>
              <p className="text-sm font-medium text-[#000000]">
                No activity yet.
              </p>
              <p className="mt-1 text-sm text-[#6b6b6b]">
                Import your employees to get started.
              </p>
            </div>
          </section>

          <section className="rounded-[6px] border border-[#e5e5e5] bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#6b6b6b]">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/employees"
                className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] transition-colors hover:bg-[#f5f5f5]"
              >
                Import Employees
              </Link>
              <Link
                href="/dashboard/campaigns"
                className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] transition-colors hover:bg-[#f5f5f5]"
              >
                Create Campaign
              </Link>
              <Link
                href="/dashboard/reports"
                className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] transition-colors hover:bg-[#f5f5f5]"
              >
                View Reports
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
