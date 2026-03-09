import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const GRAPH_USERS_BASE =
  "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,jobTitle,department,accountEnabled";

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
  const startedAt = new Date().toISOString();
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
    .eq("integration_type", "microsoft_entra")
    .eq("status", "connected")
    .single();

  if (intError || !integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  const config = integration.config_json as IntegrationConfig | null;
  const accessToken = config?.access_token;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 400 });
  }

  let usersAdded = 0;
  let usersUpdated = 0;
  let usersDeactivated = 0;

  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    let url: string | null = GRAPH_USERS_BASE;
    const allUsers: GraphUser[] = [];

    while (url) {
      console.log("Calling Graph API with token:", accessToken.substring(0, 20) + "...");
      console.log("URL:", url);
      const response = await fetch(url, { headers });
      console.log("Graph response status:", response.status);
      console.log("Graph response headers:", Object.fromEntries(response.headers.entries()));
      const data = (await response.json()) as { value?: GraphUser[]; "@odata.nextLink"?: string };
      console.log("Graph response:", JSON.stringify(data).substring(0, 500));
      if (!response.ok) {
        const err = JSON.stringify(data);
        console.error("Graph API error:", err);
        const completedAt = new Date().toISOString();
        await supabase.from("sync_logs").insert({
          organisation_id: organisationId,
          integration_id: integration.id,
          sync_type: "entra_sync",
          users_added: 0,
          users_updated: 0,
          users_deactivated: 0,
          status: "failed",
          error_log: `Graph API failed: ${err.slice(0, 1000)}`,
          started_at: startedAt,
          completed_at: completedAt,
        });
        return NextResponse.json({ error: "Graph API failed" }, { status: 502 });
      }
      allUsers.push(...(data.value ?? []));
      url = data["@odata.nextLink"] ?? null;
    }

    const users = allUsers;
    const graphEntraIds = new Set(users.map((u) => u.id));

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
        if (!updateErr) usersUpdated++;
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
        if (!insertErr) usersAdded++;
      }
    }

    // Deactivate users that exist in our DB (entra_id set) but are no longer in Graph
    const { data: existingEntraUsers } = await supabase
      .from("users")
      .select("id, entra_id")
      .eq("organisation_id", organisationId)
      .eq("role", "employee")
      .not("entra_id", "is", null);

    for (const dbUser of existingEntraUsers ?? []) {
      const entraId = dbUser.entra_id;
      if (!entraId || graphEntraIds.has(entraId)) continue;
      const { error: deactivateErr } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", dbUser.id);
      if (!deactivateErr) usersDeactivated++;
    }

    const completedAt = new Date().toISOString();
    const now = completedAt;
    await supabase
      .from("integrations")
      .update({ last_used_at: now, updated_at: now })
      .eq("id", integration.id);

    await supabase.from("sync_logs").insert({
      organisation_id: organisationId,
      integration_id: integration.id,
      sync_type: "entra_sync",
      users_added: usersAdded,
      users_updated: usersUpdated,
      users_deactivated: usersDeactivated,
      status: "success",
      error_log: null,
      started_at: startedAt,
      completed_at: completedAt,
    });

    return NextResponse.json({
      success: true,
      synced: usersAdded + usersUpdated,
      users_added: usersAdded,
      users_updated: usersUpdated,
      users_deactivated: usersDeactivated,
    });
  } catch (e) {
    const completedAt = new Date().toISOString();
    const errorMessage = e instanceof Error ? e.message : String(e);
    await supabase.from("sync_logs").insert({
      organisation_id: organisationId,
      integration_id: integration.id,
      sync_type: "entra_sync",
      users_added: usersAdded,
      users_updated: usersUpdated,
      users_deactivated: usersDeactivated,
      status: "failed",
      error_log: errorMessage.slice(0, 1000),
      started_at: startedAt,
      completed_at: completedAt,
    });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
