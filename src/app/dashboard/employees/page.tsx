import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Users, Shield, FileSpreadsheet } from "lucide-react";
import { EntraSyncButton } from "@/components/entra-sync-button";
import { CsvImportSection } from "@/components/csv-import-section";

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
    .select("organisation_id, role, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser) redirect("/sign-in");
  if (dbUser.role === "msp_admin" && dbUser.msp_id) redirect("/dashboard");
  if (!dbUser.organisation_id) redirect("/onboarding/msp");

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
      <header className="mb-6">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          People
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">Employees</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your team and view individual risk scores
        </p>
      </header>

      {!hasIntegration && (
        <>
          <section>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Import your employees
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500">
                    <Shield className="h-5 w-5" />
                  </span>
                  <span className="font-semibold text-neutral-950">Microsoft Entra / Azure AD</span>
                </div>
                <p className="mb-4 text-sm text-neutral-500">
                  Sync employees automatically from Microsoft 365
                </p>
                <Link
                  href="/api/integrations/entra/connect"
                  className="inline-block rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
                >
                  Connect Microsoft Entra
                </Link>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <span className="font-semibold text-neutral-950">Google Workspace</span>
                </div>
                <p className="mb-4 text-sm text-neutral-500">
                  Sync employees from Google Workspace
                </p>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {hasIntegration && (
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Employee list
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-neutral-500">
                Last synced: {formatLastSynced(integration.last_used_at)}
              </span>
              <EntraSyncButton organisationId={organisationId} />
            </div>
          </div>
          {!employees?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-8 w-8 text-neutral-300" />
              <p className="mt-3 text-sm font-medium text-neutral-950">No employees yet</p>
              <p className="mt-1 text-sm text-neutral-500">
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
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Email</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Department</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Job Title</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Risk Score</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-950">
                        {emp.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-neutral-950">{emp.email ?? "—"}</td>
                      <td className="px-4 py-3 text-neutral-950">{emp.department ?? "—"}</td>
                      <td className="px-4 py-3 text-neutral-950">{emp.job_title ?? "—"}</td>
                      <td className="px-4 py-3 text-neutral-950">
                        {emp.risk_score != null ? `${emp.risk_score}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${emp.is_active ? "bg-neutral-100 text-neutral-500" : "bg-neutral-100 text-neutral-400"}`}>
                          {emp.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section>
        <CsvImportSection organisationId={organisationId} />
      </section>
    </div>
  );
}
