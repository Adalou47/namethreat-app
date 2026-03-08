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
    .select("organisation_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!dbUser || !dbUser.organisation_id) {
    const clerkUser = await currentUser();
    const metadata = clerkUser?.publicMetadata as { onboarding_complete?: boolean; signup_type?: string } | undefined;
    if (metadata?.onboarding_complete === true) {
      await new Promise((r) => setTimeout(r, 300));
      const refetch = await supabase
        .from("users")
        .select("organisation_id")
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
                  <span className="h-1.5 w-1.5 rounded-full bg-[#000000]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col bg-[#ffffff]">
        <DashboardTopBar />
        <main className="flex-1 bg-[#f5f5f5] px-6 py-6">
          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4 shadow-sm shadow-[#0000000a]">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Human Risk Score
              </p>
              <p className="text-3xl font-semibold text-[#000000]">72</p>
              <p className="mt-2 text-xs text-[#6b6b6b]">
                Moderate exposure across people, process and technology.
              </p>
            </div>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4 shadow-sm shadow-[#0000000a]">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Open threats
              </p>
              <p className="text-3xl font-semibold text-[#000000]">14</p>
              <p className="mt-2 text-xs text-[#6b6b6b]">
                Active phishing campaigns and social engineering attempts.
              </p>
            </div>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4 shadow-sm shadow-[#0000000a]">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Training coverage
              </p>
              <p className="text-3xl font-semibold text-[#000000]">89%</p>
              <p className="mt-2 text-xs text-[#6b6b6b]">
                Employees who have completed the latest simulation series.
              </p>
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4 shadow-sm shadow-[#0000000a]">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Recent phishing campaigns
              </p>
              <div className="space-y-3 text-xs text-[#6b6b6b]">
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                  <span className="truncate">
                    Vendor invoice spoofing detected across 3 clients
                  </span>
                  <span className="ml-4 rounded-[20px] border border-[#fecaca] bg-[#fef2f2] px-2 py-0.5 text-[10px] font-medium text-[#b91c1c]">
                    High
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                  <span className="truncate">
                    MFA fatigue attacks targeting execs
                  </span>
                  <span className="ml-4 rounded-[20px] border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-medium text-[#6b6b6b]">
                    Contained
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                  <span className="truncate">
                    Credential harvesting via lookalike domains
                  </span>
                  <span className="ml-4 rounded-[20px] border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-medium text-[#6b6b6b]">
                    Watching
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-white p-4 shadow-sm shadow-[#0000000a]">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#6b6b6b]">
                Domain intelligence
              </p>
              <div className="space-y-3 text-xs text-[#6b6b6b]">
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                  <span className="truncate">6 lookalike registrations</span>
                  <span className="ml-4 text-[10px] text-[#6b6b6b]">
                    Last 30 days
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                  <span className="truncate">
                    2 high-risk senders blocked at gateway
                  </span>
                  <span className="ml-4 text-[10px] text-[#6b6b6b]">
                    This week
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2">
                  <span className="truncate">
                    DMARC alignment drift detected on finance domain
                  </span>
                  <span className="ml-4 text-[10px] text-[#6b6b6b]">
                    Needs review
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

