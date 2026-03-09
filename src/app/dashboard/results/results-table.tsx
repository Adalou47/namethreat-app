"use client";

import { useRouter, useSearchParams } from "next/navigation";

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
        <label className="text-sm text-[#6b6b6b]" htmlFor="campaign-filter">
          Filter by campaign
        </label>
        <select
          id="campaign-filter"
          value={currentCampaignId ?? ""}
          onChange={handleCampaignFilter}
          className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
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
          className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
        >
          Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-[#6b6b6b]" />
          <p className="text-sm font-medium text-[#000000]">No results yet.</p>
          <p className="mt-1 text-sm text-[#6b6b6b]">
            Launch a campaign to see results here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Employee</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Email</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Campaign</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Sent</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Opened</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Clicked</th>
                <th className="pb-3 font-medium text-[#6b6b6b]">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#e5e5e5] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#000000]">{r.employee}</td>
                  <td className="py-3 pr-4 text-[#000000]">{r.email}</td>
                  <td className="py-3 pr-4 text-[#000000]">{r.campaign}</td>
                  <td className="py-3 pr-4 text-[#6b6b6b]">{r.sent}</td>
                  <td className="py-3 pr-4 text-[#000000]">{r.opened}</td>
                  <td className="py-3 pr-4 text-[#000000]">{r.clicked}</td>
                  <td className="py-3 text-[#000000]">{r.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
