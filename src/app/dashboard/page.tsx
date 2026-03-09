import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Users, Mail, Shield, CheckCircle } from "lucide-react";

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
  const userRole = user.role ?? "—";
  const roleLabel = String(userRole).replace(/_/g, " ");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-sm text-[#6b6b6b]">
          Signed in as <span className="font-medium capitalize text-[#000000]">{roleLabel}</span>
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
