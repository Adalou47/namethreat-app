import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { decodeTrackingToken } from "@/lib/tracking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const decoded = decodeTrackingToken(token);
  const origin = request.nextUrl.origin;

  const redirectToCaught = (withToken: boolean) => {
    const url = new URL("/caught", origin);
    if (withToken && token) url.searchParams.set("token", token);
    return NextResponse.redirect(url.toString());
  };

  if (!decoded) {
    return redirectToCaught(false);
  }

  const { campaignId, userId } = decoded;
  const supabase = createSupabaseServiceClient();

  const { data: result, error: fetchError } = await supabase
    .from("phishing_results")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !result) {
    return redirectToCaught(false);
  }

  const linkClickedAt = (result as { link_clicked_at?: string | null }).link_clicked_at;
  if (linkClickedAt != null) {
    return redirectToCaught(true);
  }

  const now = new Date().toISOString();
  await supabase
    .from("phishing_results")
    .update({
      link_clicked_at: now,
      outcome: "clicked",
    })
    .eq("campaign_id", campaignId)
    .eq("user_id", userId);

  const { data: campaign } = await supabase
    .from("phishing_campaigns")
    .select("total_sent, total_clicked")
    .eq("id", campaignId)
    .single();

  if (campaign) {
    const totalSent = Number(campaign.total_sent) || 0;
    const newTotalClicked = (Number(campaign.total_clicked) || 0) + 1;
    const clickRate = totalSent > 0 ? (newTotalClicked / totalSent) * 100 : 0;

    await supabase
      .from("phishing_campaigns")
      .update({
        total_clicked: newTotalClicked,
        click_rate: Math.round(clickRate * 100) / 100,
      })
      .eq("id", campaignId);
  }

  return redirectToCaught(true);
}
