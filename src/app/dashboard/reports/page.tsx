import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ReportsPage() {
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
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm text-[#6b6b6b] hover:text-[#000000]">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-[#000000]">View Reports</h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">This page is under construction.</p>
      </div>
    </div>
  );
}
