import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Database } from "../../../../lib/supabase/types";

type OnboardingPayload =
  | {
      customer_type: "msp";
      organisation_name: string;
      country: string;
      size_band: string;
      website?: string;
      phone?: string;
      industry?: string | null;
      domain?: string;
    }
  | {
      customer_type: "direct";
      organisation_name: string;
      domain: string;
      country: string;
      industry: string;
      size_band: string;
    };

type MspsRow = Database["public"]["Tables"]["msps"]["Row"];
type OrganisationRow = Database["public"]["Tables"]["organisations"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as Partial<OnboardingPayload>;
  const { customer_type } = payload;

  if (!customer_type || (customer_type !== "msp" && customer_type !== "direct")) {
    return NextResponse.json(
      { error: "Invalid or missing customer_type" },
      { status: 400 },
    );
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;
  const fullName =
    clerkUser.fullName ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ??
    null;

  const supabase = createSupabaseServiceClient();

  try {
    if (customer_type === "msp") {
      const { organisation_name, country, size_band, website, phone } = payload;
      if (!organisation_name || !country || !size_band) {
        return NextResponse.json(
          { error: "Missing required fields: organisation_name, country, size_band" },
          { status: 400 },
        );
      }

      const { data: msp, error: mspError } = await supabase
        .from("msps")
        .insert({
          name: organisation_name,
          website: website ?? null,
          country,
          phone: phone ?? null,
          notes: `Clients: ${size_band}`,
        })
        .select()
        .single<MspsRow>();

      if (mspError || !msp) {
        return NextResponse.json(
          { error: mspError?.message ?? "Failed to create MSP" },
          { status: 500 },
        );
      }

      const { data: organisation, error: orgError } = await supabase
        .from("organisations")
        .insert({
          msp_id: msp.id,
          name: organisation_name,
          country,
          size_band,
          customer_type: "msp",
          onboarding_complete: false,
        })
        .select()
        .single<OrganisationRow>();

      if (orgError || !organisation) {
        return NextResponse.json(
          { error: orgError?.message ?? "Failed to create organisation" },
          { status: 500 },
        );
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          clerk_user_id: userId,
          organisation_id: organisation.id,
          msp_id: msp.id,
          email,
          full_name: fullName,
          role: "msp_admin",
          is_active: true,
          onboarding_complete: false,
        })
        .select()
        .single<UserRow>();

      if (userError || !user) {
        return NextResponse.json(
          { error: userError?.message ?? "Failed to create user" },
          { status: 500 },
        );
      }

      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { signup_type: "msp", onboarding_complete: true, organisation_id: organisation.id },
      }).catch(() => {});

      return NextResponse.json(
        {
          success: true,
          organisation_id: organisation.id,
          user_id: user.id,
          organisation,
          user,
        },
        { status: 201 },
      );
    }

    // customer_type === "direct"
    const { organisation_name, domain, country, industry, size_band } = payload;
    if (!organisation_name || !country || !industry || !size_band) {
      return NextResponse.json(
        { error: "Missing required fields: organisation_name, country, industry, size_band" },
        { status: 400 },
      );
    }

    const { data: organisation, error: orgError } = await supabase
      .from("organisations")
      .insert({
        name: organisation_name,
        domain: domain ?? null,
        country,
        industry,
        size_band,
        customer_type: "direct",
        onboarding_complete: false,
      })
      .select()
      .single<OrganisationRow>();

    if (orgError || !organisation) {
      return NextResponse.json(
        { error: orgError?.message ?? "Failed to create organisation" },
        { status: 500 },
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        clerk_user_id: userId,
        organisation_id: organisation.id,
        msp_id: null,
        email,
        full_name: fullName,
        role: "org_admin",
        is_active: true,
        onboarding_complete: false,
      })
      .select()
      .single<UserRow>();

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message ?? "Failed to create user" },
        { status: 500 },
      );
    }

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { signup_type: "company", onboarding_complete: true, organisation_id: organisation.id },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        organisation_id: organisation.id,
        user_id: user.id,
        organisation,
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
