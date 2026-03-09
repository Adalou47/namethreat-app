import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function TrainingPage() {
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
    <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
      <h1 className="text-xl font-semibold text-[#000000]">Training</h1>
      <p className="mt-2 text-sm text-[#6b6b6b]">This page is under construction.</p>
    </div>
  );
}
