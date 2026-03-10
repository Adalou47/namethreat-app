import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Building2, Users, Plug, CreditCard } from "lucide-react";

const SETTINGS_SECTIONS = [
  { title: "Organisation Details", icon: Building2 },
  { title: "Team Members", icon: Users },
  { title: "Integrations", icon: Plug },
  { title: "Billing", icon: CreditCard },
] as const;

export default async function SettingsPage() {
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
          Organisation
        </p>
        <h1 className="text-2xl font-bold text-neutral-950">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your organisation settings
        </p>
      </header>

      <div className="space-y-4">
        {SETTINGS_SECTIONS.map(({ title, icon: Icon }) => (
          <section
            key={title}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
                <p className="text-xs text-neutral-500">Coming soon</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
