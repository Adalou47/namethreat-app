import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Users, Mail, Shield, CheckCircle } from "lucide-react";

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
    const metadata = clerkUser?.publicMetadata as
      | { onboarding_complete?: boolean; signup_type?: string }
      | undefined;
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
    { count: employeeCount },
    { count: activeCampaignsCount },
  ] = await Promise.all([
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

  const totalEmployees = employeeCount ?? 0;
  const activeCampaigns = activeCampaignsCount ?? 0;

  return (
    <div className="space-y-6">
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
            <p className="text-sm font-medium text-[#000000]">
              No campaigns yet
            </p>
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
