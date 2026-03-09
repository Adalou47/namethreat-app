"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";

type CsvRow = { email: string; full_name?: string; job_title?: string; department?: string };

type ImportResult = {
  success: boolean;
  imported: number;
  skipped: number;
  errors: { row: number; email: string; reason: string }[];
};

function parseCSVPreview(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const emailIdx = headers.indexOf("email");
  if (emailIdx === -1) return [];
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const email = values[emailIdx] ?? "";
    if (!email) continue;
    const full_name = headers.indexOf("full_name") >= 0 ? values[headers.indexOf("full_name")] ?? "" : undefined;
    const job_title = headers.indexOf("job_title") >= 0 ? values[headers.indexOf("job_title")] ?? "" : undefined;
    const department = headers.indexOf("department") >= 0 ? values[headers.indexOf("department")] ?? "" : undefined;
    rows.push({ email, full_name, job_title, department });
  }
  return rows;
}

export function CsvImportSection({ organisationId }: { organisationId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<CsvRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = useCallback((f: File | null) => {
    setFile(f);
    setResult(null);
    if (!f) {
      setPreviewRows([]);
      return;
    }
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setPreviewRows([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = (reader.result as string) ?? "";
      setPreviewRows(parseCSVPreview(text));
    };
    reader.readAsText(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/employees/import-csv", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as ImportResult & { error?: string };
      if (!res.ok) {
        setResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: [{ row: 0, email: "", reason: data.error ?? "Import failed" }],
        });
        return;
      }
      setResult(data);
      setFile(null);
      setPreviewRows([]);
      router.refresh();
    } finally {
      setImporting(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setFile(null);
    setPreviewRows([]);
  };

  return (
    <section className="space-y-4">
      <p className="text-sm text-[#6b6b6b]">Or import manually</p>
      <a
        href="/employee-template.csv"
        download="employee-template.csv"
        className="inline-block text-sm font-medium text-[#000000] underline hover:no-underline"
      >
        Download template
      </a>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-[6px] border-2 border-dashed bg-white py-10 text-center transition-colors ${
          dragOver ? "border-[#000000] bg-[#f5f5f5]" : "border-[#e5e5e5]"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          id="csv-upload"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <FileSpreadsheet className="mx-auto mb-2 h-10 w-10 text-[#6b6b6b]" />
          <p className="text-sm font-medium text-[#000000]">
            Drop your CSV here or click to browse
          </p>
          <p className="mt-1 text-xs text-[#6b6b6b]">.csv only</p>
        </label>
      </div>

      {previewRows.length > 0 && !result && (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="mb-3 text-sm font-medium text-[#000000]">
            Found {previewRows.length} employee{previewRows.length !== 1 ? "s" : ""} ready to import
          </p>
          <ul className="mb-4 list-inside list-disc text-sm text-[#6b6b6b]">
            {previewRows.slice(0, 5).map((r, i) => (
              <li key={i}>
                {r.email}
                {r.full_name ? ` — ${r.full_name}` : ""}
              </li>
            ))}
            {previewRows.length > 5 && (
              <li>… and {previewRows.length - 5} more</li>
            )}
          </ul>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onImport}
              disabled={importing}
              className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111] disabled:opacity-60"
            >
              {importing ? "Importing…" : `Import ${previewRows.length} employees`}
            </button>
            <button
              type="button"
              onClick={clearResult}
              disabled={importing}
              className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5] disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="mb-2 text-sm font-medium text-[#000000]">
            {result.imported} employee{result.imported !== 1 ? "s" : ""} imported successfully
          </p>
          <p className="mb-2 text-sm text-[#6b6b6b]">
            {result.skipped} skipped (already exist)
          </p>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-sm font-medium text-[#000000]">Errors</p>
              <ul className="max-h-40 list-inside list-disc overflow-y-auto text-sm text-[#6b6b6b]">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.email || "—"} — {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={clearResult}
            className="mt-3 rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5]"
          >
            Done
          </button>
        </div>
      )}
    </section>
  );
}
