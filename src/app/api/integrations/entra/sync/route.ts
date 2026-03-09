import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const GRAPH_USERS_URL =
  "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,jobTitle,department,accountEnabled&$top=999";

type GraphUser = {
  id: string;
  displayName: string | null;
  mail: string | null;
  userPrincipalName: string | null;
  jobTitle: string | null;
  department: string | null;
  accountEnabled: boolean | null;
};

type IntegrationConfig = {
  access_token: string;
  refresh_token?: string | null;
  expires_at?: string | null;
  tenant_id?: string | null;
};

export async function POST(request: NextRequest) {
  let organisationId: string;
  try {
    const body = await request.json();
    organisationId = body.organisation_id;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!organisationId) {
    return NextResponse.json({ error: "organisation_id required" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: integration, error: intError } = await supabase
    .from("integrations")
    .select("id, config_json")
    .eq("organisation_id", organisationId)
    .eq("provider", "microsoft_entra")
    .eq("status", "active")
    .single();

  if (intError || !integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  const config = integration.config_json as IntegrationConfig | null;
  const accessToken = config?.access_token;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 400 });
  }

  const graphRes = await fetch(GRAPH_USERS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!graphRes.ok) {
    const err = await graphRes.text();
    console.error("Graph API error:", err);
    return NextResponse.json({ error: "Graph API failed" }, { status: 502 });
  }

  const graphData = (await graphRes.json()) as { value?: GraphUser[] };
  const users = graphData.value ?? [];
  let synced = 0;

  for (const u of users) {
    const email = u.mail ?? u.userPrincipalName ?? null;
    if (!email) continue;

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("entra_id", u.id)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from("users")
        .update({
          full_name: u.displayName ?? undefined,
          job_title: u.jobTitle ?? undefined,
          department: u.department ?? undefined,
          is_active: u.accountEnabled ?? undefined,
        })
        .eq("id", existing.id);
      if (!updateErr) synced++;
    } else {
      const { error: insertErr } = await supabase.from("users").insert({
        organisation_id: organisationId,
        clerk_user_id: `imported:${u.id}`,
        email,
        full_name: u.displayName ?? null,
        role: "employee",
        entra_id: u.id,
        job_title: u.jobTitle ?? null,
        department: u.department ?? null,
        is_active: u.accountEnabled ?? true,
        is_imported: true,
      });
      if (!insertErr) synced++;
    }
  }

  const now = new Date().toISOString();
  await supabase
    .from("integrations")
    .update({ last_sync_at: now, updated_at: now })
    .eq("id", integration.id);

  await supabase.from("sync_logs").insert({
    organisation_id: organisationId,
    integration_id: integration.id,
    status: "success",
    records_synced: synced,
  });

  return NextResponse.json({ success: true, synced });
}
