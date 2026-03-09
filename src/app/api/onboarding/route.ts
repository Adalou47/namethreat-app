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

/** Map frontend size_band (employee count) to DB constraint values */
const SIZE_BAND_TO_DB: Record<string, string> = {
  "1-50": "1_50",
  "51-200": "51_200",
  "201-500": "201_500",
  "501-2000": "501_2000",
  "2000+": "2000_plus",
};

/** Map frontend industry (capitalised) to DB industry_check constraint (lowercase) */
const INDUSTRY_TO_DB: Record<string, string> = {
  Construction: "construction",
  Pharma: "pharma",
  Legal: "legal",
  "IT/Tech": "it_tech",
  Finance: "finance",
  Healthcare: "healthcare",
  Manufacturing: "manufacturing",
  Retail: "retail",
  Education: "education",
  Government: "government",
  Other: "other",
};

/** Map frontend employee count to organisations customer_type for direct */
function directCustomerType(size_band: string): "direct_smb" | "direct_midmarket" {
  if (size_band === "1-50") return "direct_smb";
  return "direct_midmarket"; // 51-200, 201-500, 501-2000, 2000+
}

/** Map MSP client count bands to DB size_band (same allowed values as direct) */
const MSP_SIZE_BAND_TO_DB: Record<string, string> = {
  "1-10": "1_50",
  "11-25": "1_50",
  "26-50": "51_200",
  "51-100": "51_200",
  "100+": "2000_plus",
};

export async function POST(req: NextRequest) {
  try {
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

      // MSPs do not have their own organisation; they manage client organisations.
      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          clerk_user_id: userId,
          organisation_id: null,
          msp_id: msp.id,
          email,
          full_name: fullName,
          role: "msp_admin",
          is_active: true,
          onboarding_complete: true,
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
        publicMetadata: { signup_type: "msp", onboarding_complete: true },
      }).catch(() => {});

      return NextResponse.json(
        {
          success: true,
          msp_id: msp.id,
          user_id: user.id,
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

    const directSizeBand = SIZE_BAND_TO_DB[size_band] ?? size_band;
    const orgCustomerType = directCustomerType(size_band);
    const industryDb = INDUSTRY_TO_DB[industry] ?? industry.toLowerCase().replace(/\s*\/\s*/g, "_").replace(/-/g, "_");

    const directOrganisationData = {
      name: organisation_name,
      domain: domain ?? null,
      country,
      industry: industryDb,
      size_band: directSizeBand,
      customer_type: orgCustomerType as "direct_smb" | "direct_midmarket",
      onboarding_complete: false,
    };
    const { data: organisation, error: orgError } = await supabase
      .from("organisations")
      .insert(directOrganisationData)
      .select()
      .single<OrganisationRow>();

    if (orgError) {
      throw new Error(orgError.message);
    }
    if (!organisation) {
      throw new Error("Failed to create organisation");
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
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}
