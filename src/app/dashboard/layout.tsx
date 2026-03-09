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
    .select("id, organisation_id, email, full_name, role, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  const hasOrg = dbUser?.organisation_id != null;
  const hasMsp = dbUser?.msp_id != null;
  if (!dbUser || (!hasOrg && !hasMsp)) {
    const clerkUser = await currentUser();
    const metadata = clerkUser?.publicMetadata as
      | { onboarding_complete?: boolean; signup_type?: string }
      | undefined;
    if (metadata?.onboarding_complete === true) {
      await new Promise((r) => setTimeout(r, 300));
      const refetch = await supabase
        .from("users")
        .select("id, organisation_id, email, full_name, role, msp_id")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      dbUser = refetch.data;
    }
    const hasOrgAfter = dbUser?.organisation_id != null;
    const hasMspAfter = dbUser?.msp_id != null;
    if (!dbUser || (!hasOrgAfter && !hasMspAfter)) {
      const signupType = metadata?.signup_type;
      if (signupType === "company") {
        redirect("/onboarding/company");
      }
      redirect("/onboarding/msp");
    }
  }

  const role = dbUser.role ?? "";
  const isMspAdmin = role === "msp_admin" && dbUser.msp_id != null;

  let displayName: string;
  if (isMspAdmin && dbUser.msp_id) {
    const { data: msp } = await supabase
      .from("msps")
      .select("name")
      .eq("id", dbUser.msp_id)
      .single();
    displayName = msp?.name ?? "Dashboard";
  } else if (dbUser.organisation_id) {
    const { data: organisation } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", dbUser.organisation_id)
      .single();
    displayName = organisation?.name ?? "Organisation";
  } else {
    displayName = "Dashboard";
  }

  const userEmail = dbUser.email ?? "";

  return (
    <DashboardShell
      orgName={displayName}
      userEmail={userEmail}
      role={role}
      mspId={dbUser.msp_id ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
