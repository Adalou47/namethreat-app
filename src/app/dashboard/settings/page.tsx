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
    .select("organisation_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser?.organisation_id) redirect("/onboarding/msp");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Settings</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Manage your organisation settings
        </p>
      </header>

      <div className="space-y-4">
        {SETTINGS_SECTIONS.map(({ title, icon: Icon }) => (
          <section
            key={title}
            className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#e5e5e5] bg-white text-[#6b6b6b]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#000000]">{title}</h2>
                <p className="text-xs text-[#6b6b6b]">Coming soon</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
