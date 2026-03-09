"use client";

import { useCallback } from "react";

const OUTCOME_STYLES: Record<string, string> = {
  safe: "bg-green-100 text-green-800",
  clicked: "bg-orange-100 text-orange-800",
  credentials_submitted: "bg-red-100 text-red-800",
  reported: "bg-blue-100 text-blue-800",
};

type Row = {
  id: string;
  userName: string;
  email: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  credentialsSubmitted: boolean | null;
  reportedAt: string | null;
  outcome: string | null;
};

export function CampaignDetailClient({
  campaignId,
  rows,
}: {
  campaignId: string;
  rows: Row[];
}) {
  const exportCsv = useCallback(() => {
    const headers = [
      "Employee Name",
      "Email",
      "Sent At",
      "Opened",
      "Clicked",
      "Submitted Credentials",
      "Reported",
      "Outcome",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${(r.userName ?? "").replace(/"/g, '""')}"`,
          `"${(r.email ?? "").replace(/"/g, '""')}"`,
          r.sentAt ? new Date(r.sentAt).toISOString() : "",
          r.openedAt ? "Yes" : "No",
          r.clickedAt ? "Yes" : "No",
          r.credentialsSubmitted ? "Yes" : "No",
          r.reportedAt ? "Yes" : "No",
          r.outcome ?? "",
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${campaignId}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [campaignId, rows]);

  return (
    <section className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#000000]">
          Results
        </h2>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
        >
          Export results
        </button>
      </div>
      {!rows.length ? (
        <p className="py-8 text-center text-sm text-[#6b6b6b]">No results yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Employee Name</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Email</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Sent At</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Opened</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Clicked</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Submitted Credentials</th>
                <th className="pb-3 pr-4 font-medium text-[#6b6b6b]">Reported</th>
                <th className="pb-3 font-medium text-[#6b6b6b]">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#e5e5e5] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#000000]">{r.userName}</td>
                  <td className="py-3 pr-4 text-[#000000]">{r.email}</td>
                  <td className="py-3 pr-4 text-[#6b6b6b]">
                    {r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 pr-4 text-[#000000]">{r.openedAt ? "Yes" : "No"}</td>
                  <td className="py-3 pr-4 text-[#000000]">{r.clickedAt ? "Yes" : "No"}</td>
                  <td className="py-3 pr-4 text-[#000000]">
                    {r.credentialsSubmitted ? "Yes" : "No"}
                  </td>
                  <td className="py-3 pr-4 text-[#000000]">{r.reportedAt ? "Yes" : "No"}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-[4px] px-2 py-0.5 text-xs font-medium ${OUTCOME_STYLES[r.outcome ?? ""] ?? "bg-[#e5e5e5] text-[#6b6b6b]"}`}
                    >
                      {r.outcome ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
