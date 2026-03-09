import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, organisation_id")
    .eq("clerk_user_id", userId)
    .single();

  const organisationId = user?.organisation_id;
  if (!organisationId) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 403 });
  }

  let body: {
    organisation_id?: string;
    template_id?: string;
    name?: string;
    target_type?: string;
    target_department?: string | null;
    target_difficulty?: string | null;
    sending_domain_id?: string;
    schedule_type?: string;
    scheduled_at?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const templateId = body.template_id ?? null;
  const sendingDomainId = body.sending_domain_id ?? null;
  const scheduleType = body.schedule_type ?? "now";
  const scheduledAt = body.scheduled_at ?? null;
  const targetType = body.target_type ?? "all";
  const targetDepartment = body.target_department ?? null;
  const targetDifficulty = body.target_difficulty ?? null;

  if (!name) {
    return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  }
  if (!templateId) {
    return NextResponse.json({ error: "Template is required" }, { status: 400 });
  }
  if (!sendingDomainId) {
    return NextResponse.json({ error: "Sending domain is required" }, { status: 400 });
  }
  if (scheduleType === "later" && !scheduledAt) {
    return NextResponse.json({ error: "Scheduled time is required when scheduling for later" }, { status: 400 });
  }

  const status =
    scheduleType === "now"
      ? "active"
      : scheduleType === "later"
        ? "scheduled"
        : "draft";

  const { data: campaign, error } = await supabase
    .from("phishing_campaigns")
    .insert({
      organisation_id: organisationId,
      name,
      status,
      template_id: templateId,
      sending_domain_id: sendingDomainId,
      target_department: targetType === "department" ? targetDepartment : null,
      target_difficulty: targetType === "difficulty" ? targetDifficulty : null,
      scheduled_at: scheduleType === "later" && scheduledAt ? scheduledAt : null,
      total_targets: 0,
      total_sent: 0,
      total_opened: 0,
      total_clicked: 0,
      total_reported: 0,
      created_by_user_id: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: campaign.id });
}
