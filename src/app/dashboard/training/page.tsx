import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";

export default async function TrainingPage() {
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
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Security Training</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Assign and track security awareness courses
        </p>
      </header>

      <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#6b6b6b]">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-[#000000]">No training assigned yet</p>
          <button
            type="button"
            disabled
            className="mt-4 cursor-not-allowed rounded-[4px] border border-[#e5e5e5] bg-[#e5e5e5] px-4 py-2.5 text-sm font-medium text-[#6b6b6b]"
          >
            Browse Courses
          </button>
        </div>
      </div>
    </div>
  );
}
