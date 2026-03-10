import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { generateTrackingToken } from "@/lib/tracking";

const SES_REGION = process.env.AWS_SES_REGION ?? "us-east-1";
const FROM_EMAIL = process.env.SES_FROM_EMAIL ?? "namethreat@cloudproalert.com";
const TRACKING_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://namethreat.com";

// TODO: remove sandbox override when SES production approved
const SANDBOX_OVERRIDE_TO = "adrian.apalaghiei@outlook.com";

function getSesClient() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY");
  }
  return new SESClient({
    region: SES_REGION,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: campaignId } = await params;
  if (!campaignId) {
    return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, organisation_id, role, msp_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 403 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("phishing_campaigns")
    .select("id, organisation_id, template_id, status, target_department")
    .eq("id", campaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const orgId = campaign.organisation_id;
  if (!orgId) {
    return NextResponse.json({ error: "Campaign has no organisation" }, { status: 400 });
  }

  let canLaunch = false;
  if (dbUser.organisation_id === orgId) {
    canLaunch = true;
  } else if (dbUser.role === "msp_admin" && dbUser.msp_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .eq("id", orgId)
      .eq("msp_id", dbUser.msp_id)
      .maybeSingle();
    if (org) canLaunch = true;
  }
  if (!canLaunch) {
    return NextResponse.json({ error: "Not allowed to launch this campaign" }, { status: 403 });
  }

  const status = campaign.status ?? "";
  if (status !== "draft" && status !== "scheduled") {
    return NextResponse.json(
      { error: "Campaign can only be launched when status is draft or scheduled" },
      { status: 400 }
    );
  }

  const templateId = campaign.template_id;
  if (!templateId) {
    return NextResponse.json({ error: "Campaign has no template" }, { status: 400 });
  }

  const { data: template, error: templateError } = await supabase
    .from("phishing_templates")
    .select("id, subject, body_html, sender_name")
    .eq("id", templateId)
    .maybeSingle();

  if (templateError || !template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  let employeesQuery = supabase
    .from("users")
    .select("id, email, full_name")
    .eq("organisation_id", orgId)
    .eq("role", "employee")
    .eq("is_active", true);

  if (campaign.target_department) {
    employeesQuery = employeesQuery.eq("department", campaign.target_department);
  }

  const { data: employees, error: employeesError } = await employeesQuery;

  if (employeesError) {
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }

  const { data: existingDeliveries } = await supabase
    .from("campaign_deliveries")
    .select("user_id")
    .eq("campaign_id", campaignId);
  const alreadySentUserIds = new Set(
    (existingDeliveries ?? []).map((d) => d.user_id).filter(Boolean)
  );

  const list = (employees ?? [])
    .filter((e) => e.email?.trim() && !alreadySentUserIds.has(e.id));
  if (list.length === 0) {
    return NextResponse.json(
      {
        error:
          alreadySentUserIds.size > 0
            ? "All targets have already been sent to for this campaign"
            : "No employees with email addresses to send to",
      },
      { status: 400 }
    );
  }

  const fromAddress =
    template.sender_name?.trim()
      ? `"${template.sender_name.replace(/"/g, '\\"')}" <${FROM_EMAIL}>`
      : FROM_EMAIL;

  let sesClient: SESClient;
  try {
    sesClient = getSesClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "SES not configured" },
      { status: 500 }
    );
  }

  let sentCount = 0;
  const errors: { userId: string; error: string }[] = [];

  for (const employee of list) {
    const userId = employee.id;
    const trackingToken = generateTrackingToken(campaignId, userId);
    const phishingLink = `${TRACKING_BASE_URL}/api/track/${trackingToken}`;

    const bodyHtml = (template.body_html ?? "").replace(
      /\{\{PHISHING_LINK\}\}/g,
      phishingLink
    );
    const subject = (template.subject ?? "Message").replace(
      /\{\{PHISHING_LINK\}\}/g,
      phishingLink
    );

    // TODO: remove sandbox override when SES production approved
    const toAddress = SANDBOX_OVERRIDE_TO;

    try {
      const command = new SendEmailCommand({
        Source: fromAddress,
        Destination: { ToAddresses: [toAddress] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: bodyHtml, Charset: "UTF-8" },
          },
        },
      });

      await sesClient.send(command);
      sentCount += 1;

      const now = new Date().toISOString();

      await supabase.from("campaign_deliveries").insert({
        campaign_id: campaignId,
        user_id: userId,
        sent_at: now,
        outcome: null,
      });

      await supabase.from("phishing_results").insert({
        campaign_id: campaignId,
        user_id: userId,
        organisation_id: orgId,
        email_sent_at: now,
        outcome: null,
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ userId, error: message });
    }
  }

  const totalTargets = list.length;
  await supabase
    .from("phishing_campaigns")
    .update({
      status: "active",
      total_targets: totalTargets,
      total_sent: sentCount,
      started_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  return NextResponse.json({
    ok: true,
    totalTargets,
    sent: sentCount,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
