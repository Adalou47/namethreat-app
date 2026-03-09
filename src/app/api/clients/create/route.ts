import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const SIZE_BAND_TO_DB: Record<string, string> = {
  "1-50": "1_50",
  "51-200": "51_200",
  "201-500": "201_500",
  "501-2000": "501_2000",
  "2000+": "2000_plus",
};

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

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, role, msp_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!user || user.role !== "msp_admin" || !user.msp_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    name?: string;
    domain?: string;
    country?: string;
    industry?: string;
    size_band?: string;
    primary_contact_name?: string | null;
    primary_contact_email?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const domain = typeof body.domain === "string" ? body.domain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "") : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry : "";
  const sizeBand = typeof body.size_band === "string" ? body.size_band : "";

  if (!name) return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  if (!domain) return NextResponse.json({ error: "Company domain is required" }, { status: 400 });
  if (!country) return NextResponse.json({ error: "Country is required" }, { status: 400 });
  if (!industry) return NextResponse.json({ error: "Industry is required" }, { status: 400 });
  if (!sizeBand) return NextResponse.json({ error: "Employee count is required" }, { status: 400 });

  const sizeBandDb = SIZE_BAND_TO_DB[sizeBand] ?? sizeBand;
  const industryDb = INDUSTRY_TO_DB[industry] ?? industry.toLowerCase().replace(/\s*\/\s*/g, "_").replace(/-/g, "_");

  const { data: organisation, error } = await supabase
    .from("organisations")
    .insert({
      name,
      domain: domain || null,
      country,
      industry: industryDb,
      size_band: sizeBandDb,
      customer_type: "msp_managed",
      msp_id: user.msp_id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, organisation_id: organisation.id });
}
