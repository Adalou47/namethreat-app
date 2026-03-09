import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const supabase = createSupabaseServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("organisation_id, role, msp_id")
    .eq("clerk_user_id", userId)
    .single();

  const url = new URL(request.url);
  const paramOrgId = url.searchParams.get("organisation_id");

  let organisationId: string | null = user?.organisation_id ?? null;

  if (paramOrgId && user?.role === "msp_admin" && user?.msp_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .eq("id", paramOrgId)
      .eq("msp_id", user.msp_id)
      .single();
    if (org) organisationId = org.id;
  }

  if (!organisationId) {
    return NextResponse.redirect(new URL("/onboarding/company", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const clientId = process.env.AZURE_CLIENT_ID;
  const redirectUri = process.env.AZURE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Azure integration not configured" },
      { status: 500 }
    );
  }

  const state = encodeURIComponent(organisationId);
  const scope = encodeURIComponent("https://graph.microsoft.com/.default offline_access");
  const authUrl =
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${scope}` +
    `&state=${state}`;

  return NextResponse.redirect(authUrl);
}
