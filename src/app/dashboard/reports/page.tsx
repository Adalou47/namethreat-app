import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("organisation_id, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser || (dbUser.organisation_id == null && dbUser.msp_id == null)) redirect("/onboarding/msp");

  return (
    <div className="space-y-8">
      <header className="mb-6">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Compliance
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Download compliance and security reports
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <BarChart3 className="mx-auto h-8 w-8 text-neutral-300" />
        <p className="mt-3 text-sm font-medium text-neutral-950">No reports generated yet</p>
        <p className="mt-1 text-sm text-neutral-500">
          Generate a report to download compliance and security data.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
}
