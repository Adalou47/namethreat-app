import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        i += 1;
        let cell = "";
        while (i < line.length && line[i] !== '"') {
          cell += line[i];
          i += 1;
        }
        if (line[i] === '"') i += 1;
        out.push(cell.trim());
        if (line[i] === ",") i += 1;
      } else {
        let cell = "";
        while (i < line.length && line[i] !== ",") {
          cell += line[i];
          i += 1;
        }
        out.push(cell.trim());
        if (line[i] === ",") i += 1;
      }
    }
    return out;
  };
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  return { headers, rows };
}

function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    record[key] = (row[i] ?? "").trim();
  });
  return record;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: user } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("clerk_user_id", userId)
    .single();

  const organisationId = user?.organisation_id;
  if (!organisationId) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const { headers, rows } = parseCSV(text);
  const emailIdx = headers.findIndex((h) => h.trim().toLowerCase() === "email");
  if (emailIdx === -1) {
    return NextResponse.json(
      { error: "CSV must contain an 'email' column" },
      { status: 400 }
    );
  }

  const errors: { row: number; email: string; reason: string }[] = [];
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const record = rowToRecord(headers, row);
    const email = (record.email ?? "").trim();
    const fullName = (record.full_name ?? "").trim() || null;
    const jobTitle = (record.job_title ?? "").trim() || null;
    const department = (record.department ?? "").trim() || null;
    const rowNum = i + 2;

    if (!email) {
      errors.push({ row: rowNum, email: "", reason: "Missing email" });
      continue;
    }
    if (!EMAIL_REGEX.test(email)) {
      errors.push({ row: rowNum, email, reason: "Invalid email format" });
      continue;
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("organisation_id", organisationId)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      skipped += 1;
      continue;
    }

    const { error: insertErr } = await supabase.from("users").insert({
      organisation_id: organisationId,
      clerk_user_id: `imported:${email}`,
      email,
      full_name: fullName,
      job_title: jobTitle,
      department: department,
      role: "employee",
      is_imported: true,
      is_active: true,
    });

    if (insertErr) {
      errors.push({ row: rowNum, email, reason: insertErr.message });
    } else {
      imported += 1;
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    errors,
  });
}
