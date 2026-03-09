import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // organisationId

  const redirectUri = process.env.AZURE_REDIRECT_URI;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/employees?error=missing_params", baseUrl));
  }
  if (!redirectUri || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard/employees?error=config", baseUrl));
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Entra token exchange failed:", err);
    return NextResponse.redirect(new URL("/dashboard/employees?error=token", baseUrl));
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  const config = {
    tenant_id: "common",
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at: expiresAt,
  };

  const supabase = createSupabaseServiceClient();

  const { data: integration, error: insertError } = await supabase
    .from("integrations")
    .insert({
      organisation_id: state,
      provider: "microsoft_entra",
      status: "active",
      config_json: config,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Entra integration insert failed:", insertError);
    return NextResponse.redirect(new URL("/dashboard/employees?error=db", baseUrl));
  }

  try {
    await fetch(`${baseUrl}/api/integrations/entra/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organisation_id: state }),
    });
  } catch (e) {
    console.error("Entra initial sync failed:", e);
  }

  return NextResponse.redirect(new URL("/dashboard/employees", baseUrl));
}
