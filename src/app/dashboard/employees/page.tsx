import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Users, Shield, FileSpreadsheet } from "lucide-react";
import { EntraSyncButton } from "@/components/entra-sync-button";

function formatLastSynced(at: string | null): string {
  if (!at) return "Never";
  const d = new Date(at);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default async function EmployeesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser?.organisation_id) redirect("/onboarding/msp");

  const organisationId = dbUser.organisation_id;

  const [
    { data: integration },
    { data: employees },
  ] = await Promise.all([
    supabase
      .from("integrations")
      .select("id, last_used_at")
      .eq("organisation_id", organisationId)
      .eq("integration_type", "microsoft_entra")
      .eq("status", "connected")
      .maybeSingle(),
    supabase
      .from("users")
      .select("id, full_name, email, department, job_title, risk_score, is_active")
      .eq("organisation_id", organisationId)
      .eq("role", "employee")
      .order("full_name"),
  ]);

  const hasIntegration = !!integration;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Employees</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Manage your team and view individual risk scores
        </p>
      </header>

      {!hasIntegration && (
        <>
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
              Import your employees
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#00a4ef] text-white">
                    <Shield className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-[#000000]">Microsoft Entra / Azure AD</span>
                </div>
                <p className="mb-4 text-sm text-[#6b6b6b]">
                  Sync employees automatically from Microsoft 365
                </p>
                <Link
                  href="/api/integrations/entra/connect"
                  className="inline-block rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
                >
                  Connect Microsoft Entra
                </Link>
              </div>
              <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#e5e5e5] bg-white text-[#6b6b6b]">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-[#000000]">Google Workspace</span>
                </div>
                <p className="mb-4 text-sm text-[#6b6b6b]">
                  Sync employees from Google Workspace
                </p>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-[4px] border border-[#e5e5e5] bg-[#e5e5e5] px-4 py-2.5 text-sm font-medium text-[#6b6b6b]"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </section>
          <section>
            <p className="mb-3 text-sm text-[#6b6b6b]">Or import manually</p>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-[4px] border border-[#e5e5e5] bg-[#e5e5e5] px-4 py-2.5 text-sm font-medium text-[#6b6b6b]"
            >
              CSV upload (coming soon)
            </button>
          </section>
        </>
      )}

      {hasIntegration && (
        <section className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
              Employee list
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#6b6b6b]">
                Last synced: {formatLastSynced(integration.last_used_at)}
              </span>
              <EntraSyncButton organisationId={organisationId} />
            </div>
          </div>
          {!employees?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#6b6b6b]">
                <Users className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-[#000000]">No employees yet</p>
              <p className="mt-1 text-sm text-[#6b6b6b]">
                Run a sync to pull users from Microsoft Entra.
              </p>
              <div className="mt-4">
                <EntraSyncButton organisationId={organisationId} />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Name</th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Email</th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Department</th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Job Title</th>
                    <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Risk Score</th>
                    <th className="pb-3 font-medium text-[#6b6b6b]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-[#e5e5e5] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[#000000]">
                        {emp.full_name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-[#000000]">{emp.email ?? "—"}</td>
                      <td className="py-3 pr-4 text-[#000000]">{emp.department ?? "—"}</td>
                      <td className="py-3 pr-4 text-[#000000]">{emp.job_title ?? "—"}</td>
                      <td className="py-3 pr-4 text-[#000000]">
                        {emp.risk_score != null ? `${emp.risk_score}` : "—"}
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
      )}
    </div>
  );
}
