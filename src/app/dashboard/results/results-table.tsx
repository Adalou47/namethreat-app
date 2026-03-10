"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3 } from "lucide-react";

type Campaign = { id: string; name: string | null };
type Row = {
  id: string;
  employee: string;
  email: string;
  campaign: string;
  sent: string;
  opened: string;
  clicked: string;
  outcome: string;
};

export function ResultsTable({
  campaigns,
  currentCampaignId,
  rows,
}: {
  campaigns: Campaign[];
  currentCampaignId: string | null;
  rows: Row[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCampaignFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    const next = new URLSearchParams(searchParams.toString());
    if (v) next.set("campaign_id", v);
    else next.delete("campaign_id");
    router.push(`/dashboard/results${next.toString() ? `?${next}` : ""}`);
  };

  const exportCsv = () => {
    const headers = ["Employee", "Email", "Campaign", "Sent", "Opened", "Clicked", "Outcome"];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${(r.employee ?? "").replace(/"/g, '""')}"`,
          `"${(r.email ?? "").replace(/"/g, '""')}"`,
          `"${(r.campaign ?? "").replace(/"/g, '""')}"`,
          `"${(r.sent ?? "").replace(/"/g, '""')}"`,
          r.opened,
          r.clicked,
          r.outcome,
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "phishing-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-neutral-500" htmlFor="campaign-filter">
          Filter by campaign
        </label>
        <select
          id="campaign-filter"
          value={currentCampaignId ?? ""}
          onChange={handleCampaignFilter}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950"
        >
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name ?? c.id}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
        >
          Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <BarChart3 className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-3 text-sm font-medium text-neutral-950">No results yet.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Launch a campaign to see results here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Employee</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Campaign</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Sent</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Opened</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Clicked</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-950">{r.employee}</td>
                    <td className="px-4 py-3 text-neutral-950">{r.email}</td>
                    <td className="px-4 py-3 text-neutral-950">{r.campaign}</td>
                    <td className="px-4 py-3 text-neutral-500">{r.sent}</td>
                    <td className="px-4 py-3 text-neutral-950">{r.opened}</td>
                    <td className="px-4 py-3 text-neutral-950">{r.clicked}</td>
                    <td className="px-4 py-3 text-neutral-950">{r.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
