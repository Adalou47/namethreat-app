import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const { data: organisation } = await supabase
    .from("organisations")
    .select("name")
    .eq("id", dbUser.organisation_id)
    .single();

  const orgName = organisation?.name ?? "Organisation";
  const userEmail = dbUser.email ?? "";

  return (
    <DashboardShell orgName={orgName} userEmail={userEmail}>
      {children}
    </DashboardShell>
  );
}
